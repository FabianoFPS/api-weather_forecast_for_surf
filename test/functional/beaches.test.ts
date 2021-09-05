import { Beach } from '@src/models/beach';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beaches functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'j@email.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
  });

  describe('When create a new beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
      expect(response.body).toMatchObject(newBeach);
    });

    it('shold return 422 when there is a validation erro', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" at path "lat"',
      });
    });

    it('should return 500 when there is any error other than validation error', async () => {
      /* Verificar o mock
      jest
        .spyOn(Beach.prototype, 'save')
        .mockImplementationOnce(() => Promise.reject('fail to create beach'));
      */
      jest.spyOn(Beach.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('fail to create beach [functional test]');
      });

      const newBeach = {
        lat: -33.792726,
        lng: 46.43243,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .send(newBeach)
        .set({ 'x-access-token': token });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        error: 'Server Error',
        message: 'Something went wrong',
      });
    });
  });
});
