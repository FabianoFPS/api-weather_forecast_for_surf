import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import { User } from '@src/models/user';

export interface DecodeUser extends Omit<User, '_id'> {
  id: string;
}

export interface JwtToken {
  sub: string;
}

export default class AuthService {
  private static SECRET: string = config.get('App.auth.key');
  private static EXPIRES_IN: number = config.get('App.auth.tokenExpiresIn');

  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(sub: string): string {
    return jwt.sign({ sub }, AuthService.SECRET, {
      expiresIn: AuthService.EXPIRES_IN,
    });
  }

  public static decodeToken(token: string): JwtToken {
    return jwt.verify(token, AuthService.SECRET) as JwtToken;
  }
}
