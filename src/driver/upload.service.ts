import { Injectable } from '@nestjs/common';
import { STATUS_SUCCESS, STATUS_FAILED } from 'src/utils/codes';
@Injectable()
export class UploadService {
  handleTruckPhotoUpload(body: {
    fileName?: string;
    message: string;
    statusCode: number;
  }) {
    const { fileName, message, statusCode } = body;
    let messages = [];
    try {
      if (statusCode !== STATUS_SUCCESS) {
        throw new Error(message);
      } else messages.push(message);
      return {
        statusCode,
        messages,
        lisencePhoto: fileName,
      };
    } catch (e) {
      messages.push('The lisence photo was not uploaded', e.message);
      return {
        statusCode,
        messages,
      };
    }
  }

  handleLisencePhotoUpload(body: {
    fileName?: string;
    message: string;
    statusCode: number;
  }) {
    const { fileName, message, statusCode } = body;
    let messages = [];
    try {
      if (statusCode !== STATUS_SUCCESS) {
        throw new Error(message);
      } else messages.push(message);
      return {
        statusCode,
        messages,
        lisencePhoto: fileName,
      };
    } catch (e) {
      messages.push('The lisence photo was not uploaded', e.message);
      return {
        statusCode,
        messages,
      };
    }
  }
}
