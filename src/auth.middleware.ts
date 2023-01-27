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

        const { role, phoneNumber, id } = decoded;

        if (role == roleEnums.driver) {
          var user: any = await this.loggerService.getDriver(id);
        }

        if (user.phoneNumber == phoneNumber) {
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
