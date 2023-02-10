import { Injectable } from '@nestjs/common';
import { driverLoginDto, adminLoginDto } from './dtos/login.dto';
import { Driver } from 'src/driver/driver.entity';
import { Admin } from 'src/admin/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  STATUS_FAILED,
  STATUS_SUCCESS,
  STATUS_UNAUTHORIZED,
} from 'src/utils/codes';
import { responseInterface } from 'src/utils/interfaces/response';
import * as jwt from 'jsonwebtoken';
import { compareSync } from 'bcrypt';
import { roleEnums } from 'src/utils/enums';
import { generateToken } from 'src/utils/commonfunctions';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
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
      if (response) {
        let token = generateToken(response.id, roleEnums.driver, phoneNumber);
        delete response.otp;
        data.push({ ...response, token });
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

  async adminLogin(body: adminLoginDto): Promise<responseInterface> {
    const { username, password } = body;
    let messages = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      let res = await this.adminRepository.findOne({ where: [{ username }] });
      if (res) {
        const { password: databasePassword } = res;
        if (compareSync(password, databasePassword)) {
          messages.push('The user is successfully logged in');
          let token = generateToken(res.id, roleEnums.admin, body.username);
          let admin = await this.adminRepository.findOne({
            where: [{ username }],
          });
          delete admin.password;
          data = [{ ...admin, token }];
        } else {
          messages.push('The password for this username is incorrect');
          statusCode = STATUS_UNAUTHORIZED;
        }
      } else {
        messages.push('The user cannot login successfully');
        statusCode = STATUS_UNAUTHORIZED;
      }
    } catch (error) {
      messages.push('The user cannot login successfully');
      messages.push(error.message);
      console.log(error);
    } finally {
      return {
        messages,
        data,
        statusCode,
      };
    }
  }
}
