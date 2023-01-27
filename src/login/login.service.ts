import { Injectable } from '@nestjs/common';
import { driverLoginDto } from './dtos/login.dto';
import { Driver } from 'src/driver/driver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  async driverLogin(body: driverLoginDto) {
    const { phoneNumber, otp } = body;
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];
    try {
      let response = await this.driverRepository.findOne({
        where: [{ phoneNumber }, { otp }],
      });
      console.log(response);
      if (response) {
        delete response.otp;
        data.push(response);
        messages.push('The login was successful');
        statusCode = STATUS_SUCCESS;
      } else {
        messages.push('The login was not successful');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      console.log(err);
      messages.push('The login was not successful');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        messages,
        statusCode,
        data,
      };
    }
  }
}
