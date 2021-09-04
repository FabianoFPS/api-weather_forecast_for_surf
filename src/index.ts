import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

function exitApp(
  status: ExitStatus,
  error?: unknown,
  isUncaughtException = false
) {
  const log = {
    ['1']: () => logger.error(`App exited with error: ${error}`),
    ['0']: () => logger.info(`App exited with success`),
  };

  if (isUncaughtException) {
    logger.error(`App exiting due to an uncaught exception: ${error}`);
  } else {
    log[status]();
  }

  process.exit(status);
}

function exitAppWithSuccess() {
  exitApp(ExitStatus.Success);
}

function exitAppWithFailure(error: unknown) {
  exitApp(ExitStatus.Failure, error);
}

function exitAppUncaughtException(error: unknown) {
  exitApp(ExitStatus.Failure, error, true);
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason ${reason}`
  );
  throw reason;
});

process.on('uncaughtException', exitAppUncaughtException);

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    exitSignals.map((sig) => {
      process.on(sig, async () => {
        try {
          await server.close();
          exitAppWithSuccess();
        } catch (error) {
          exitAppWithFailure(error);
        }
      });
    });
  } catch (error) {
    exitAppWithFailure(error);
  }
})();
