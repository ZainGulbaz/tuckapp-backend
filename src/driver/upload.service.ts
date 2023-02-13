import { Injectable } from '@nestjs/common';
import { STATUS_SUCCESS, STATUS_FAILED } from 'src/utils/codes';
@Injectable()
export class UploadService {
  handleTruckPhotoUpload(fileName: string) {
    try {
      return {
        statusCode: STATUS_SUCCESS,
        message: 'The truck photo was uploaded successfully',
        truckPhoto: fileName,
      };
    } catch (e) {
      return {
        statusCode: STATUS_FAILED,
        message: 'The truck photo was not uploaded',
      };
    }
  }

  handleLisencePhotoUpload(fileName: string) {
    try {
      return {
        statusCode: STATUS_SUCCESS,
        message: 'The lisence photo was uploaded successfully',
        truckPhoto: fileName,
      };
    } catch (e) {
      return {
        statusCode: STATUS_FAILED,
        message: 'The lisence photo was not uploaded',
      };
    }
  }
}
