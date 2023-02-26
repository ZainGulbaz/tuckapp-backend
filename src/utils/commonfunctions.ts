import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import { responseInterface } from './interfaces/response';
import { STATUS_FAILED, STATUS_UNAUTHORIZED } from './codes';

export function generateToken(id: number, role: string, username: string) {
  return jwt.sign(
    {
      id,
      role,
      username: username,
    },
    process.env.JWT_SECRET,
  );
}

export function verifyRoleAccess(data: {
  role: string;
  allowedRoles: string[];
}): responseInterface | true {
  let responseObj: responseInterface | true = {
    data: [],
    messages: [],
    statusCode: 0,
  };

  try {
    if (data.role && data.allowedRoles.length > 0) {
      if (data.allowedRoles.includes(data.role)) {
        responseObj = true;
        return;
      } else {
        responseObj.statusCode = STATUS_UNAUTHORIZED;
        responseObj.messages.push('You are not authorized for this request');
        responseObj.data = [];
      }
    } else {
      responseObj.statusCode = STATUS_FAILED;
      responseObj.messages.push('We are unable to serve this request');
      responseObj.data = [];
    }
  } catch (err) {
    responseObj = {
      statusCode: STATUS_FAILED,
      messages: ['We are unable to server this request'],
      data: [],
    };
  } finally {
    return responseObj;
  }
}

export function removeKeysFromBody(keys: string[], body: object) {
  keys?.map((key) => delete body[key]);
}

export function generateRandomOtp() {
  return Math.floor(Math.random() * 1000000);
}

export function checkKeys(keys: string[], obj: any): boolean {
  let objKeys = Object.keys(obj);
  if (keys.length !== objKeys.length) return true;
  for (let i = 0; i < objKeys.length; i++) {
    if (!keys.includes(objKeys[i])) {
      return true;
    }
  }
  return false;
}
