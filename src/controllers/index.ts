import { Response } from 'express';
import mongoose from 'mongoose';

import { CUSTOM_VALIDATION } from '@src/models/user';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/util/errors/api-error';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: Error | mongoose.Error.ValidationError
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const { code, error: errorMessage } = this.handleClientErrors(error);
      res.status(code).send(ApiError.format({ code, message: errorMessage }));
    } else {
      logger.error(error);
      res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Something went wrong' }));
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const duplicateKindErros = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATE
    );

    if (duplicateKindErros.length) {
      return { code: 409, error: error.message };
    } else {
      return { code: 400, error: error.message };
    }
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
