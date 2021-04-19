import axios from 'axios';

import { StormGlass } from '@src/clients/StormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture
  from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StromGlass Client', () => {
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.741258;
    const lng = 151.562158;

    axios.get = jest.fn().mockResolvedValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(axios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  })
})
