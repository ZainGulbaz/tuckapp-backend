import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { LoggerService } from './auth.service';
import { STATUS_FAILED, STATUS_UNAUTHORIZED } from './utils/codes';
import { roleEnums } from './utils/enums';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (
        req.header('authorization')?.startsWith('Bearer') &&
        req.header('authorization')
      ) {
        let token: string = req.header('authorization')?.split(' ')[1] + '';
        let decoded: any = jwt.verify(token, process.env.JWT_SECRET + '');
        const { role, username, id } = decoded;
        let user = { username: undefined };

        if (role == roleEnums.driver) {
          let res = await this.loggerService.getDriver(id);
          user.username = res.phoneNumber;
          console.log(decoded, res);
        } else if (role == roleEnums.admin) {
          let res = await this.loggerService.getAdmin(id);
          user.username = res.username;
        }
        if (user.username == username) {
          req.body.role = role;
          next();
        } else {
          res.json({
            statusCode: STATUS_UNAUTHORIZED,
            messages: [
              'The user is unauthorized',
              'Authorization Failed! No user found',
            ],
            data: [],
          });
        }
      } else {
        res.json({
          statusCode: STATUS_UNAUTHORIZED,
          messages: [
            'The user is unauthorized',
            'Authorization Failed! No token found',
          ],
          data: [],
        });
      }
    } catch (err) {
      console.log(err);
      res.json({
        statusCode: STATUS_FAILED,
        messages: ['The user is unauthorized', err.message],
        data: [],
      });
    }
  }
}
