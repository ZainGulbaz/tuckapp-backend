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
import { Category } from 'src/category/category.entity';
import { Repository } from 'typeorm';
import { updateDriverDto } from './dtos/driver.update.dto';
import { generateToken, verifyRoleAccess } from 'src/utils/commonfunctions';
import { roleEnums } from 'src/utils/enums';
import { Driver_Service } from './driver_service.entity';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Driver_Service)
    private driverServiceRepository: Repository<Driver_Service>,
    @InjectRepository(Category)
    private categoryServiceRepository: Repository<Category>,
  ) {}

  async createDriver(body: createDriverDto): Promise<responseInterface> {
    let message = [],
      statusCode = STATUS_SUCCESS,
      data = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let res = await this.driverRepository.insert({
        ...body,
      });
      if (res.raw.insertId > 0) {
        statusCode = STATUS_SUCCESS;
        let token = generateToken(
          res.raw.insertId,
          roleEnums.driver,
          body.phoneNumber,
        );
        let servicesDriverArr = [];
        if (body.services) {
          servicesDriverArr = this.formDriverSerivieObj(
            JSON.parse(body.services),
            res.raw.insertId,
          );
          await this.driverServiceRepository.insert(servicesDriverArr);

          delete body.services;
          delete body.categoryId;
        }
        data = [{ ...body, token, id: res.raw.insertId }];
        Logger.log(
          `The request to register the driver is submitted successfully with id "${res.raw.insertId}"`,
        );
        message.push(
          'The request to register the driver is submitted successfully',
        );
      } else {
        Logger.log('The request to register the driver is failed');
        message.push('The request to register the driver is failed to submit');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      if (err.code == 'ER_DUP_ENTRY')
        message.push(
          'The driver with this phone number/lisence plate is already registered',
        );
      else
        message.push('The request to register the driver is failed to submit');

      Logger.error('Error in createDriver method of Driver Service');
      console.log(err);
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

  async getAllDrivers(role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    Logger.log('DRIVER SERVICE is called');

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

      const drivers = await this.driverRepository.find({
        select: {
          driverServices: {
            serviceId: true,
            driverId: false,
            id: false,
            service: {
              id: false,
              name: true,
            },
          },
        },
        relations: {
          driverServices: {
            service: true,
          },
          category: true,
        },
      });
      Logger.log(`The drivers are fetched successfully`);
      message.push('The drivers are fetched successfully');
      statusCode = STATUS_SUCCESS;
      data = drivers;
    } catch (err) {
      Logger.error('The drivers could not be fetched');
      console.log(err);
      message.push('The drivers could not be fetched');
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

  async getDriver(
    id: number,
    role: string,
    authId: number,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin, roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      if (role == roleEnums.driver) {
        if (authId != id) throw new Error('You cannot access other drivers Id');
      }

      const driverRes = await this.driverRepository.find({
        where: [{ id }],
        select: {
          driverServices: {
            serviceId: true,
            driverId: false,
            id: false,
            service: {
              id: false,
              name: true,
            },
          },
        },
        relations: {
          driverServices: {
            service: true,
          },
          category: true,
        },
      });

      if (driverRes) {
        let [driver] = driverRes;
        delete driver.otp;
        data.push(driver);
        statusCode = STATUS_SUCCESS;
        message.push('The driver was fetched successfully');
        Logger.log(`The driver with id ${id} is successfully fetched`);
      } else {
        statusCode = STATUS_NOTFOUND;
        message.push('The driver was not found');
        Logger.warn(`The driver with id ${id} was not found`);
      }
    } catch (err) {
      statusCode = STATUS_FAILED;
      Logger.error('The driver could not be found');
      console.log(err);
      message.push('The drivers could not be fetched');
      message.push(err.message);
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }

  async deleteDriver(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    Logger.log('DRIVER SERVICE is called');

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
      let res = await this.driverRepository.delete(id);
      if (res.affected > 0) {
        message.push('The driver was successfully deleted');
        statusCode = STATUS_SUCCESS;
      } else {
        message.push('The driver could not be deleted');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      message.push('The driver could not be deleted');
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

  async updateDriver(
    id: number,
    body: updateDriverDto,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    Logger.log('DRIVER SERVICE is called');

    try {
      let isAllowed = verifyRoleAccess({
        role: body?.role,
        allowedRoles: [roleEnums.driver, roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
      delete body.role;
      delete body.authId;
      let res = await this.driverRepository.update(id, body);
      if (res.affected == 1) {
        let updatedDriver = await this.driverRepository.findOneBy({ id });
        delete updatedDriver.otp;
        data.push(updatedDriver);
        statusCode = STATUS_SUCCESS;
        message.push('The driver is updated successfully');
        Logger.log(`The driver with ${id} is updated successfully`);
      } else {
        message.push('The driver is not updated successfully');
        Logger.warn(`The driver with ${id} is was not found`);
        statusCode = STATUS_NOTFOUND;
      }
    } catch (err) {
      Logger.error('Error in updateDriver method of DriverService');
      console.log(err);
      message.push('The driver is not updated successfully');
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

  formDriverSerivieObj(servicesArray: number[], driverId: number) {
    try {
      let driverServiceObjArr = servicesArray.map((serviceId) => {
        return {
          serviceId,
          driverId,
        };
      });
      return driverServiceObjArr;
    } catch (err) {
      throw new Error(
        'Error in mining object for driver_service entity ' + err.message,
      );
    }
  }
  async updateCoordinates(
    coordinates: string,
    driverId: number,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];
    try {
      let updateCoordinates = await this.driverRepository.update(driverId, {
        currentCoordinates: coordinates,
      });
      if (updateCoordinates.affected !== 1) {
        throw new Error('The drivers current location is not updated');
      }
      message.push('The driver current location is updated successfully');
      statusCode = STATUS_SUCCESS;
    } catch (err) {
      message.push('The drivers current location is not updated');
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
  async driverOnChat(
    driverId: number,
    isChat: boolean | string,
    role: string,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: role,
        allowedRoles: [roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let driver = await this.driverRepository.findOne({
        where: { id: driverId },
      });
      if (!driver.id) throw new Error('The driver id is invalid');
      else if (driver.id !== driverId)
        throw new Error('You cannot access/change other drivers status');
      else if (driver.onRide > 0)
        throw new Error('Driver is already completing a ride');

      let res = await this.driverRepository.update(driverId, {
        onRide: isChat == 'true' ? -1 : 0,
      });
      if (res.affected > 0) {
        message.push(
          `The chat status for driver is ${
            isChat == 'true' ? 'activated' : 'deactivated'
          } successfully`,
        );
      } else
        throw new Error(
          'The driver chat status is not updated in the database',
        );
    } catch (err) {
      message.push(
        `The driver chat status is not ${
          isChat == 'true' ? 'activated' : 'deactivated'
        } successfully`,
      );
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

  async distance(driverId:number,role:string):Promise<responseInterface>{
    let statusCode=STATUS_SUCCESS,data=[],message=[];
    try{
        let isAllowed = verifyRoleAccess({
          role: role,
          allowedRoles: [roleEnums.driver],
        });
        if (isAllowed !== true) {
          statusCode = isAllowed.statusCode;
          message = isAllowed.message;
          return;
        }

        let driver=await this.driverRepository.findOne({where:{id:driverId}});
        if(!driver.onRide){
          statusCode=STATUS_FAILED;
          message.push("No ride has been assigned to you");
          return;
        }

        let ride=await this.driverRepository.query(`Select * from ride where id=${driver.onRide}`);
  

        let pickupDistance=await this.driverRepository.query(`SELECT ROUND(ST_Distance(
          Point(${driver.currentCoordinates}),
          Point(${ride[0].startLocation})
      )* 100,0) AS distance`);
       
      let destinationDistance=await this.driverRepository.query(`SELECT ROUND(ST_Distance(
        Point(${driver.currentCoordinates}),
        Point(${ride[0].endLocation})
    )* 100,0) AS distance`);


      data=[{pickupDistance:(ride[0].isStart)?null:pickupDistance[0].distance,destinationDistance:destinationDistance[0].distance,destinationRadius:parseInt(process.env.DESTINATION_RADIUS),pickupRadius:parseInt(process.env.PICKUP_RADIUS),units:"meter"}];
      message.push("The distance from driver is fetched successfully");
      statusCode=STATUS_SUCCESS;
      return;
    }
    catch(error)
    {
      statusCode=STATUS_FAILED;
      message.push("The distance of driver is not fetched successfully");
      message.push(error.message);

    }   
    finally{
     return{
      statusCode,
      message,
      data
     }
    }
  }
  async getLocation(driverId:number,role:string):Promise<responseInterface>{
    let statusCode=STATUS_FAILED,data=[],message=[];
    try{
      let isAllowed = verifyRoleAccess({
        role: role,
        allowedRoles: [roleEnums.driver,roleEnums.customer],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
     let driver= await this.driverRepository.findOne({where:{id:driverId}});
     if(!driver)
     {
      message.push("The id of the driver does not exist");
      statusCode=STATUS_FAILED;
      return;

     }
     data=[{currentLocation:driver.currentCoordinates}];
     message.push("The driver location is fetched successfully");
     statusCode=STATUS_SUCCESS;
    }
    catch(error){
      message.push("The driver location is not fetched successfully");
      message.push(error.message);
      statusCode=STATUS_FAILED;
    }
    finally{
      return{
        data,
        statusCode,
        message
      }

    }
  }
}
