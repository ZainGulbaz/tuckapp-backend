import { Injectable } from '@nestjs/common';
import {
  driverLoginDto,
  adminLoginDto,
  customerLoginDto,
} from './dtos/login.dto';
import { Driver } from 'src/driver/driver.entity';
import { Admin } from 'src/admin/admin.entity';
import { Customer } from 'src/customer/customer.entity';
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
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async driverLogin(body: driverLoginDto) {
    const { phoneNumber, otp } = body;
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    try {
      let response = await this.driverRepository.findOne({
        where: [{ phoneNumber }],
      });
      if (response) {
        if (!compareSync(otp + '', response.otp + ''))
          throw new Error('Wrong otp provided');
        let token = generateToken(response.id, roleEnums.driver, phoneNumber);
        delete response.otp;
        data.push({ ...response, token });
        message.push('The login was successful');
        statusCode = STATUS_SUCCESS;
      } else {
        message.push('The login was not successful');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      console.log(err);
      message.push('The login was not successful');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
        statusCode,
        data,
      };
    }
  }

  async adminLogin(body: adminLoginDto): Promise<responseInterface> {
    const { username, password } = body;
    let message = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      let res = await this.adminRepository.findOne({ where: [{ username }] });
      if (res) {
        const { password: databasePassword } = res;
        if (compareSync(password, databasePassword)) {
          message.push('The user is successfully logged in');
          let token = generateToken(res.id, roleEnums.admin, body.username);
          let admin = await this.adminRepository.findOne({
            where: [{ username }],
          });
          delete admin.password;
          data = [{ ...admin, token }];
        } else {
          message.push('The password for this username is incorrect');
          statusCode = STATUS_UNAUTHORIZED;
        }
      } else {
        message.push('The user cannot login successfully');
        statusCode = STATUS_UNAUTHORIZED;
      }
    } catch (error) {
      message.push('The user cannot login successfully');
      message.push(error.message);
      console.log(error);
    } finally {
      return {
        message,
        data,
        statusCode,
      };
    }
  }

  async customerLogin(body: customerLoginDto) {
    const { email, otp } = body;
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    try {
      let response = await this.customerRepository.findOne({
        where: [{ email, otp }],
      });
      if (response) {
        let token = generateToken(response.id, roleEnums.customer, email);
        delete response.otp;
        data.push({ ...response, token });
        message.push('The login was successful');
        statusCode = STATUS_SUCCESS;
      } else {
        throw new Error('The otp is incorrect');
      }
    } catch (err) {
      console.log(err);
      message.push('The login was not successful');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
        statusCode,
        data,
      };
    }
  }
}
