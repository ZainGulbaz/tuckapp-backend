import { Injectable, Body } from '@nestjs/common';
import { responseInterface } from '../utils/interfaces/response';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { Admin } from './admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateToken } from 'src/utils/commonfunctions';
import { adminCreateDto } from './dtos/admin.create.dto';
import { genSaltSync, hashSync } from 'bcrypt';
import { roleEnums } from 'src/utils/enums';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {}
  async createAdmin(@Body() body: adminCreateDto): Promise<responseInterface> {
    let messages = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      console.log(body);
      let salt = genSaltSync();
      let encryptedPassword = hashSync(body.password, salt);
      body.password = encryptedPassword;
      let res = await this.adminRepository.insert(body);
      if (res.raw[0].id > 0) {
        delete body.password;
        data.push({ ...body });
        messages.push('The admin is created successfully');
      } else {
        messages.push('The admin cannot be created successfully');
        statusCode = STATUS_FAILED;
      }
    } catch (error) {
      messages.push('The admin cannot be created successfully');
      messages.push(error.message);
      statusCode = STATUS_FAILED;
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
