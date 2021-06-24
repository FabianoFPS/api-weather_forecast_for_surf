import { Response } from 'express';
import mongoose from 'mongoose';

import { CUSTOM_VALIDATION } from '@src/models/user';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: Error | mongoose.Error.ValidationError
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error)
      const { code, error: errorMessage } = clientErrors;
      res.status(code).send({ code, error: errorMessage });
    } else {
      res.status(500).send({ code: 500, error: 'Someting went wrong' });
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): { code: number; error: string } {
    const duplicateKindErros = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATE
    );

    if (duplicateKindErros.length) {
      return { code: 409, error: error.message };
    } else {
      return { code: 422, error: error.message };
    }
  }
}
