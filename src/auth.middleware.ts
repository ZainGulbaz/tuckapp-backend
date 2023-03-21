import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { LoggerService } from './auth.service';
import { STATUS_FAILED, STATUS_UNAUTHORIZED } from './utils/codes';
import { roleEnums } from './utils/enums';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  roleFunctionMapping = {
    [roleEnums.driver]: async (id: number) => {
      let res = await this.loggerService.getDriver(id);
      return res.phoneNumber;
    },
    [roleEnums.admin]: async (id: number) => {
      let res = await this.loggerService.getAdmin(id);
      return res.username;
    },
    [roleEnums.customer]: async (id: number) => {
      let res = await this.loggerService.getCustomer(id);
      return res.phoneNumber;
    },
  };

  checkDriverCredentials = async (
    res: Response,
    req: Request,
    id: number,
  ): Promise<Boolean> => {
    try {
      if (this.filterDriverChecks(req.url, { id: id })) return false;
      let isDriverValidated = await this.loggerService.validateDriver(id);

      if (isDriverValidated !== true) {
        res.json({
          messages: [isDriverValidated],
          statusCode: STATUS_UNAUTHORIZED,
          data: [],
        });
        return true;
      }
      return false;
    } catch (err) {
      throw new Error('Error in checking driver credentials');
    }
  };

  credentialsFunctionMapping = {
    [roleEnums.driver]: this.checkDriverCredentials,
    [roleEnums.customer]: (res: Response, req: Request, id: number) => false,
    [roleEnums.admin]: (res: Response, req: Request, id: number) => false,
  };

  filterDriverChecks(url: string, data: any) {
    if (url == `/${process.env.GLOBAL_PREFIX}/driver/${data.id}`) {
      return true;
    }
    return false;
  }

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
        user.username = await this.roleFunctionMapping[role](id);

        if (await this.credentialsFunctionMapping[role](res, req, id)) {
          return;
        }

        if (user.username == username && username !== undefined) {
          req.body.role = role;
          req.body.authId = id;
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
