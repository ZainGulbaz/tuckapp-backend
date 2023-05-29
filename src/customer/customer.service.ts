import { Injectable, Logger } from '@nestjs/common';
import {
  STATUS_FAILED,
  STATUS_NOTFOUND,
  STATUS_SUCCESS,
} from 'src/utils/codes';
import { responseInterface } from 'src/utils/interfaces/response';
import { CreateCustomerDto } from './dtos/create.customer.dto';
import { Customer } from './customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { roleEnums } from 'src/utils/enums';
import { generateToken } from 'src/utils/commonfunctions';
import { verifyRoleAccess } from 'src/utils/commonfunctions';
import { removeKeysFromBody } from 'src/utils/commonfunctions';
import { generateRandomOtp } from 'src/utils/commonfunctions';
import { sendEmail } from 'src/utils/emailhandler';
import { UpdateCustomerDto } from './dtos/update.customer.dto';
@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(
    body: CreateCustomerDto,
    file,
  ): Promise<responseInterface> {
    let message = [],
      data = [],
      statusCode = STATUS_SUCCESS;
    try {
      if (body.uploadStatusCode == STATUS_FAILED) {
        message.push(body.uploadMessage);
        statusCode = STATUS_FAILED;
        return;
      }

      let res = await this.customerRepository.insert(body);
      if (res.raw.insertId > 0) {
        statusCode = STATUS_SUCCESS;
        let token = generateToken(
          res.raw.insertId,
          roleEnums.customer,
          body.email,
        );

        data = [{ ...body, token }];
        Logger.log(
          `The customer is created successfully with id "${res.raw.insertId}"`,
        );
        message.push('The customer is created successfully');
      } else {
        Logger.log('The customer cannot be created successfully');
        message.push('The customer cannot be created successfully');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      message.push('The customer cannot be created successfully');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
        data,
        statusCode,
      };
    }
  }

  async getAllCustomers(role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    Logger.log('Customer SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let customers = await this.customerRepository.find({});
      Logger.log(`The customers are fetched successfully`);
      message.push('The customers are fetched successfully');
      statusCode = STATUS_SUCCESS;
      data = customers;
    } catch (err) {
      Logger.error('The customers could not be fetched');
      console.log(err);
      message.push('The customers could not be fetched');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async getCustomer(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];

    Logger.log('Customer SERVICE is called');

    let isAllowed = verifyRoleAccess({
      role,
      allowedRoles: [roleEnums.admin, roleEnums.customer],
    });
    if (isAllowed !== true) {
      statusCode = isAllowed.statusCode;
      message = isAllowed.message;
      return;
    }

    try {
      const customer = await this.customerRepository.findOneBy({ id });
      if (customer !== null) {
        data.push(customer);
        statusCode = STATUS_SUCCESS;
        message.push('The customer was fetched successfully');
        Logger.log(`The customer with id ${id} is successfully fetched`);
      } else {
        statusCode = STATUS_NOTFOUND;
        message.push('The customer was not found');
        Logger.warn(`The customer with id ${id} was not found`);
      }
    } catch (err) {
      statusCode = STATUS_FAILED;
      Logger.error('The customer could not be found');
      console.log(err);
      message.push('The customers could not be fetched');
      message.push(err.message);
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async deleteCustomer(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    Logger.log('Customer SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
      let res = await this.customerRepository.delete(id);
      if (res.affected > 0) {
        message.push('The Customer was successfully deleted');
        statusCode = STATUS_SUCCESS;
      } else {
        message.push('The Customer could not be deleted');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      message.push('The Customer could not be deleted');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async updateCustomer(
    id: number,
    body: UpdateCustomerDto,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];
    Logger.log('Customer SERVICE is called');

    try {
      removeKeysFromBody(['phoneNumber', 'email'], body);
      let isAllowed = verifyRoleAccess({
        role: body?.role,
        allowedRoles: [roleEnums.admin, roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
      delete body.role;
      delete body.authId;
      let res = await this.customerRepository.update(id, body);
      if (res.affected == 1) {
        let updatedcustomer = await this.customerRepository.findOneBy({ id });
        data.push(updatedcustomer);
        statusCode = STATUS_SUCCESS;
        message.push('The customer is updated successfully');
        Logger.log(`The customer with ${id} is updated successfully`);
      } else {
        message.push('The customer is not updated successfully');
        Logger.warn('The customer with ${id} is was not found');
        statusCode = STATUS_NOTFOUND;
      }
    } catch (err) {
      Logger.error('Error in updatecustomer method of customerService');
      console.log(err);
      message.push('The customer is not updated successfully');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async generateCustomerOtp(
    email: string,
    role: string,
  ): Promise<responseInterface> {
    let message = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      const otp: number = generateRandomOtp(parseInt(process.env.DIGITS_OTP));
      let res = await this.customerRepository
        .createQueryBuilder()
        .update({ otp })
        .where(`email = '${email}'`)
        .execute();
      if (res.affected > 0) {
        let customer = await this.customerRepository.findOneBy({ email });
        if (!customer) throw new Error('Unable to find the customer');

        let subject = 'TRUCK APP OTP';
        let text = `Your one time password (otp) for TRUCK APP is ${otp}`;
        let Emailres = await sendEmail({ to: customer.email, subject, text });
        if (Emailres !== true && typeof Emailres == 'string')
          throw new Error(Emailres);
        message.push(
          'The otp has been generated successfully, check your email',
        );
        statusCode = STATUS_SUCCESS;
        return;
      } else {
        throw new Error('The otp was not updated in the database');
      }
    } catch (err) {
      message.push('The otp was not generated successfully');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }
}
