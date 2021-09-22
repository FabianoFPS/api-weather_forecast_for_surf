import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { BaseController } from '.';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({
        ...req.body,
        ...{ userId: req.context?.userId },
      });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      if (
        error instanceof Error ||
        error instanceof mongoose.Error.ValidationError
      )
        this.sendCreateUpdateErrorResponse(res, error);
      /*       if (error instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: error.message });
      } else {
        if (error instanceof Error) logger.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
      } */
    }
  }
}
