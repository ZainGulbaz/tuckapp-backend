import { Injectable, Logger } from '@nestjs/common';
import { createDriverDto } from './dtos/driver.create.dto';
import { responseInterface } from 'src/utils/interfaces/response';
import {
  STATUS_FAILED,
  STATUS_NOTFOUND,
  STATUS_SUCCESS,
} from 'src/utils/codes';
import 'dotenv/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './driver.entity';
import { Repository } from 'typeorm';
import { updateDriverDto } from './dtos/driver.update.dto';
import { generateToken, verifyRoleAccess } from 'src/utils/commonfunctions';
import { roleEnums } from 'src/utils/enums';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  async createDriver(body: createDriverDto): Promise<responseInterface> {
    let messages = [],
      statusCode = STATUS_SUCCESS,
      data = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let res = await this.driverRepository.insert(body);
      if (res.raw.insertId > 0) {
        statusCode = STATUS_SUCCESS;
        let token = generateToken(
          res.raw.insertId,
          roleEnums.driver,
          body.phoneNumber,
        );

        data = [{ ...body, token }];
        Logger.log(
          `The request to register the driver is submitted successfully with id "${res.raw.insertId}"`,
        );
        messages.push(
          'The request to register the driver is submitted successfully',
        );
      } else {
        Logger.log('The request to register the driver is failed');
        messages.push('The request to register the driver is failed to submit');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      if (err.code == 'ER_DUP_ENTRY')
        messages.push(
          'The driver with this phone number/lisence plate is already registered',
        );
      else
        messages.push('The request to register the driver is failed to submit');

      Logger.error('Error in createDriver method of Driver Service');
      console.log(err);
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }

  async getAllDrivers(role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let drivers = await this.driverRepository.find({});
      Logger.log(`The drivers are fetched successfully`);
      messages.push('The drivers are fetched successfully');
      statusCode = STATUS_SUCCESS;
      data = drivers;
    } catch (err) {
      Logger.error('The drivers could not be fetched');
      console.log(err);
      messages.push('The drivers could not be fetched');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }

  async getDriver(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      messages = [];

    Logger.log('DRIVER SERVICE is called');

    let isAllowed = verifyRoleAccess({
      role,
      allowedRoles: [roleEnums.admin, roleEnums.driver],
    });
    if (isAllowed !== true) {
      statusCode = isAllowed.statusCode;
      messages = isAllowed.messages;
      return;
    }

    try {
      const driver = await this.driverRepository.findOneBy({ id });
      if (driver !== null) {
        delete driver.otp;
        data.push(driver);
        statusCode = STATUS_SUCCESS;
        messages.push('The driver was fetched successfully');
        Logger.log(`The driver with id ${id} is successfully fetched`);
      } else {
        data.push(driver);
        statusCode = STATUS_NOTFOUND;
        messages.push('The driver was not found');
        Logger.warn(`The driver with id ${id} was not found`);
      }
    } catch (err) {
      statusCode = STATUS_FAILED;
      Logger.error('The driver could not be found');
      console.log(err);
      messages.push('The drivers could not be fetched');
      messages.push(err.message);
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }

  async deleteDriver(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }
      let res = await this.driverRepository.delete(id);
      if (res.affected > 0) {
        messages.push('The driver was successfully deleted');
        statusCode = STATUS_SUCCESS;
      } else {
        messages.push('The driver could not be deleted');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      messages.push('The driver could not be deleted');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }

  async updateDriver(
    id: number,
    body: updateDriverDto,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      messages = [],
      data = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role: body?.role,
        allowedRoles: [roleEnums.driver, roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }
      delete body.role;
      let res = await this.driverRepository.update(id, body);
      if (res.affected == 1) {
        let updatedDriver = await this.driverRepository.findOneBy({ id });
        delete updatedDriver.otp;
        data.push(updatedDriver);
        statusCode = STATUS_SUCCESS;
        messages.push('The driver is updated successfully');
        Logger.log(`The driver with ${id} is updated successfully`);
      } else {
        messages.push('The driver is not updated successfully');
        Logger.warn('The driver with ${id} is was not found');
        statusCode = STATUS_NOTFOUND;
      }
    } catch (err) {
      Logger.error('Error in updateDriver method of DriverService');
      console.log(err);
      messages.push('The driver is not updated successfully');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }
}
