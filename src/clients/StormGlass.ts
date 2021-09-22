import config, { IConfig } from 'config';
import CacheUtil from '@src/util/cache';

import { InternalError } from '@src/util/errors/InternalError';
import * as HTTPUtil from '@src/util/Request';
import { Time } from '@src/util/time';
import logger from '@src/logger';

export interface StormGlassSource {
  noaa: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassSource;
  readonly waveDirection: StormGlassSource;
  readonly swellDirection: StormGlassSource;
  readonly swellHeight: StormGlassSource;
  readonly swellPeriod: StormGlassSource;
  readonly windDirection: StormGlassSource;
  readonly windSpeed: StormGlassSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  time: string;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(
    protected request = new HTTPUtil.Request(),
    protected cacheUtil = CacheUtil
  ) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const cacheKey = this.getCacheKey(lat, lng);
    const cachedForecastPoints = this.getForcastPointsFromCache(cacheKey);

    if (!cachedForecastPoints) {
      const forecastPoints = await this.getForecastPointsFromApi(lat, lng);
      this.setForecastPointsInCache(cacheKey, forecastPoints);
      return forecastPoints;
    }

    return cachedForecastPoints;
  }

  protected async getForecastPointsFromApi(
    lat: number,
    lng: number
  ): Promise<ForecastPoint[]> {
    const endTimestmp = Time.getUnixTimeForFutureDays(1);
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get(
          'apiUrl'
        )}/weather/point?lat=${lat}&lng=${lng}&params=${
          this.stormGlassAPIParams
        }&source=${this.stormGlassAPISource}&end=${endTimestmp}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apiToken'),
          },
        }
      );

      return this.normalizeResponse(response.data);
    } catch (err) {
      const axiosError = HTTPUtil.Request.isRequestError(err);
      if (axiosError) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(axiosError.response?.data)} Code: ${
            axiosError.response?.status
          }`
        );
      }
      let message = 'undefined';
      if (err instanceof Error) message = err.message;
      throw new ClientRequestError(message);
    }
  }

  private getCacheKey(lat: number, lng: number): string {
    return `forecast_points_${lat}_${lng}`;
  }

  protected getForcastPointsFromCache(
    key: string
  ): ForecastPoint[] | undefined {
    logger.info(`Using cache to return forecast points for key: ${key}`);
    return this.cacheUtil.get<ForecastPoint[]>(key);
  }

  protected setForecastPointsInCache(
    key: string,
    forecastPoints: ForecastPoint[]
  ): boolean {
    logger.info(`Updating cache to return forecast points for key: ${key}`);
    return this.cacheUtil.set(
      key,
      forecastPoints,
      stormGlassResourceConfig.get('cacheTtl')
    );
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
