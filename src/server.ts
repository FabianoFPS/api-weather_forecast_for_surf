import './util/module-alias';
import { Server } from '@overnightjs/core';
// import bodyParser from 'body-parser';
import { Application, json } from 'express';
import * as http from 'http';
import cors from 'cors';
import expressPino from 'express-pino-logger';
import apiSchema from './api.schema.json';
import swaggerUi from 'swagger-ui-express';
import { OpenApiValidator } from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';
import { BeachesController } from './controllers/beaches';
import { UserController } from './controllers/users';
import logger from './logger';

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docSetup();
    this.setupControllers();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    // this.app.use(bodyParser.json());
    this.app.use(json());
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(cors({ origin: '*' }));
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UserController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async docSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: true,
      validateResponses: true,
    }).install(this.app);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();

    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server?.close((err) => {
          if (err) return reject(err);

          resolve();
        });
      });
    }
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      logger.info(`Server listening of port: ${this.port}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
