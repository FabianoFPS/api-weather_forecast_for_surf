import AuthService from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('Auth middleware', () => {
  it('should verify a JWT token and call the next middleare', () => {
    const jwtToken = AuthService.generateToken('fake');
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUNTHORIZED if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'invalid-token',
      },
    };

    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as Record<string, unknown>, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return ANAUNTHORIZED middleware if theres no token', () => {
    const reqFake = {
      headers: {},
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as Record<string, unknown>, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
});
