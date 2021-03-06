import { Controller, Middleware, Post, Get } from '@overnightjs/core';
import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { User } from '@src/models/user';
import { BaseController } from '.';
import AuthService from '@src/services/auth';
import { authMiddleware } from '@src/middlewares/auth';
import ApiError from '@src/util/errors/api-error';

@Controller('users')
export class UserController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (error) {
      if (
        error instanceof Error ||
        error instanceof mongoose.Error.ValidationError
      )
        this.sendCreateUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found!',
      });

    if (!(await AuthService.comparePasswords(password, user.password)))
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password does not match',
      });

    const token = AuthService.generateToken(user.id);
    return res.status(200).send({ ...user.toJSON(), ...{ token } });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const _id: string | undefined = req.context?.userId;
    const user = await User.findOne({ _id });

    if (!user)
      return this.sendErrorResponse(
        res,
        ApiError.format({ code: 404, message: 'User not found' })
      );

    return res.send({ user });
  }
}
