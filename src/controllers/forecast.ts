import { Request, Response } from 'express';

import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/Forecast';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });

      const forecastData = await forecast.processForecastBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
