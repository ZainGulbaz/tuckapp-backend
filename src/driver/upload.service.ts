import { Injectable } from '@nestjs/common';
import { STATUS_SUCCESS, STATUS_FAILED } from 'src/utils/codes';
@Injectable()
export class UploadService {
  handleTruckPhotoUpload(body: {
    fileName?: string;
    message: string;
    statusCode: number;
  }) {
    const { fileName, message:msg, statusCode } = body;
    let message = [];
    try {
      if (statusCode !== STATUS_SUCCESS) {
        throw new Error(msg);
      } else message.push(msg);
      return {
        statusCode,
        message,
        lisencePhoto: fileName,
      };
    } catch (e) {
      message.push('The lisence photo was not uploaded', e.message);
      return {
        statusCode,
        message,
      };
    }
  }

  handleLisencePhotoUpload(body: {
    fileName?: string;
    message: string;
    statusCode: number;
  }) {
    const { fileName, message:msg, statusCode } = body;
    let message = [];
    try {
      if (statusCode !== STATUS_SUCCESS) {
        throw new Error(msg);
      } else message.push(message);
      return {
        statusCode,
        message,
        lisencePhoto: fileName,
      };
    } catch (e) {
      message.push('The lisence photo was not uploaded', e.message);
      return {
        statusCode,
        message,
      };
    }
  }
}
