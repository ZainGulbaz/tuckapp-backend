import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import { responseInterface } from './interfaces/response';
import { STATUS_FAILED, STATUS_UNAUTHORIZED } from './codes';
import Axios from "axios";

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
    message: [],
    statusCode: 0,
  };

  try {
    if (data.role && data.allowedRoles.length > 0) {
      if (data.allowedRoles.includes(data.role)) {
        responseObj = true;
        return;
      } else {
        responseObj.statusCode = STATUS_UNAUTHORIZED;
        responseObj.message.push('You are not authorized for this request');
        responseObj.data = [];
      }
    } else {
      responseObj.statusCode = STATUS_FAILED;
      responseObj.message.push('We are unable to serve this request');
      responseObj.data = [];
    }
  } catch (err) {
    responseObj = {
      statusCode: STATUS_FAILED,
      message: ['We are unable to server this request'],
      data: [],
    };
  } finally {
    return responseObj;
  }
}

export function removeKeysFromBody(keys: string[], body: object) {
  keys?.map((key) => delete body[key]);
}

export function generateRandomOtp(noOfDigits: number): number {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < noOfDigits; i++) {
    let data = digits[Math.floor(Math.random() * 10)];
    if (data == '0') i--;
    else OTP += data;
  }
  return parseInt(OTP);
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

export const reverseCoordinates = (coordinates: string): string =>
  coordinates.split(',').reverse().join(',');

export const parseNull = (data: string | number): string => {
  if (data == null || data == undefined) return "''";
  return `'${data}'`;
};


export const getCity=async(coordinates:number[]|string[]):Promise<{countryName:string,city:string}>=>{
  try{
      const[lat,lng]=coordinates;
      let response=await Axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      return response.data;
  }
  catch(err)
  {
    throw new Error(err);
  }
}