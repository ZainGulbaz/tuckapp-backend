import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver/driver.entity';
import { STATUS_FAILED, STATUS_SUCCESS } from './utils/codes';
import { responseInterface } from './utils/interfaces/response';
import { hashSync, genSaltSync } from 'bcrypt';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async generateOtp(id: number): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [],
      digitisOfOtp = 1000000;
    try {
      let otp = Math.floor(Math.random() * digitisOfOtp);
      const salt = genSaltSync();
      const encryptedOtp = hashSync(otp + '', salt);
      let res = await this.driverRepository.update(id, { otp: encryptedOtp });
      if (res.affected > 0) {
        let driver = await this.driverRepository.findOne({ where: [{ id }] });
        data = [{ ...driver, otp }];
        messages.push('The otp has been successfully generated');
      } else {
        messages.push('The otp could not be generated');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      messages.push('The otp could not be generated');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        data,
        messages,
      };
    }
  }
}
