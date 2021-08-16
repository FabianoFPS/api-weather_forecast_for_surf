import AuthService from '@src/services/auth';
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.['x-access-token'];
  try {
    const decoded = AuthService.decodeToken(token as string);
    req.decoded = decoded;
    // if (typeof token === 'string') req.decoded = AuthService.decodeToken(token);

    next();
  } catch (error) {
    res.status?.(401).send({ code: 401, error: error.message });
  }
}
