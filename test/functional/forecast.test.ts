import { Beach, BeachPosition } from "@src/models/beach";
import nock from 'nock';

import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFix from '@test/fixtures/api_forecast_response_1_beach.json';

describe('Beach forecast functional tests', () => {
  beforeEach(async () => {
    await Beach.deleteMany({});
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
    };

    const beach = new Beach(defaultBeach);
    await beach.save();
  });

  it('should return a forecast with just a few times', async () => {
    // nock.recorder.rec();
    nock('https://api.stormglass.io:443', {"encodedQueryParams":true})
    .get('/v2/weather/point')
    .query({"%0A%20%20%20%20%20%20%20%20lat":"-33.792726","%0A%20%20%20%20%20%20%20%20lng":"151.289824","%0A%20%20%20%20%20%20%20%20params":"swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed","%0A%20%20%20%20%20%20%20%20source":"noaa"})
    .reply(200, stormGlassWeather3HoursFixture);

    // nock('https://api.stormglass.io:443', {
    //   encodedQueryParams: true,
    //   reqheaders: {
    //     Authorization: (): boolean => true,
    //   },
    // })
    //   .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    //   .get('/v2/weather/point')
    //   .query({
    //     lat: '-33.792726',
    //     lng: '151.289824',
    //     params: /(.*)/,
    //     source: 'noaa',
    //   })
    //   .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await global.testRequest.get('/forecast');
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFix);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {"encodedQueryParams":true})
    .get('/v2/weather/point')
    .query({"%0A%20%20%20%20%20%20%20%20lat":"-33.792726","%0A%20%20%20%20%20%20%20%20lng":"151.289824","%0A%20%20%20%20%20%20%20%20params":"swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed","%0A%20%20%20%20%20%20%20%20source":"noaa"})
    .replyWithError('Something went wrong');

    // nock('https://api.stormglass.io:443', {
    //   encodedQueryParams: true,
    //   reqheaders: {
    //     Authorization: (): boolean => true,
    //   },
    // })
    //   .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    //   .get('/v1/weather/point')
    //   .query({ lat: '-33.792726', lng: '151.289824' })
    //   .replyWithError('Something went wrong');

    const { status } = await global.testRequest.get(`/forecast`);

    expect(status).toBe(500);
  });
});
