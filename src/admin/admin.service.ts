import { Injectable, Body } from '@nestjs/common';
import { responseInterface } from '../utils/interfaces/response';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { Admin } from './admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { adminCreateDto } from './dtos/admin.create.dto';
import { genSaltSync, hashSync } from 'bcrypt';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {}
  async createAdmin(@Body() body: adminCreateDto): Promise<responseInterface> {
    let message = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      console.log(body);
      let salt = genSaltSync();
      let encryptedPassword = hashSync(body.password, salt);
      body.password = encryptedPassword;
      let res = await this.adminRepository.insert(body);
      if (res.raw.insertId > 0) {
        delete body.password;
        data.push({ ...body, id: res.raw.insertId });
        message.push('The admin is created successfully');
      } else {
        message.push('The admin cannot be created successfully');
        statusCode = STATUS_FAILED;
      }
    } catch (error) {
      message.push('The admin cannot be created successfully');
      message.push(error.message);
      statusCode = STATUS_FAILED;
      console.log(error);
    } finally {
      return {
        message,
        data,
        statusCode,
      };
    }
  }
}
