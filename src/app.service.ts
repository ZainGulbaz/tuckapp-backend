import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver/driver.entity';
import { STATUS_FAILED, STATUS_SUCCESS } from './utils/codes';
import { responseInterface } from './utils/interfaces/response';
import { hashSync, genSaltSync } from 'bcrypt';
import { roleEnums } from './utils/enums';
import { generateRandomOtp, verifyRoleAccess } from './utils/commonfunctions';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  getHello(): string {
    return 'Hello World';
  }

  async generateOtp(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message.push(isAllowed.message);
        return;
      }

      let otp = generateRandomOtp(parseInt(process.env.DIGITS_OTP));
      const salt = genSaltSync();
      const encryptedOtp = hashSync(otp + '', salt);
      let res = await this.driverRepository.update(id, { otp: encryptedOtp });
      if (res.affected > 0) {
        let driver = await this.driverRepository.findOne({ where: [{ id }] });
        data = [{ ...driver, otp }];
        message.push('The otp has been successfully generated');
      } else {
        message.push('The otp could not be generated');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      message.push('The otp could not be generated');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        data,
        message,
      };
    }
  }
}
