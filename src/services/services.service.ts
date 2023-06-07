import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './services.entity';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { responseInterface } from 'src/utils/interfaces/response';
import { verifyRoleAccess } from 'src/utils/commonfunctions';
import { roleEnums } from 'src/utils/enums';
import { SortOrderDto } from './dtos/sort.order.service.dto';
import { CreateServiceDto } from './dtos/create.service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}
  async getAllServices(): Promise<responseInterface> {
    let data = [],
      statusCode = STATUS_SUCCESS,
      message = [];
    try {
      let allservices = await this.serviceRepository.query(
        `Select CONCAT('[',GROUP_CONCAT(JSON_OBJECT(id,name) ORDER BY sortOrder ASC),']') services,type from service WHERE isDisable=0 Group BY type`,
      );
      data = allservices;
      message.push('The services are fetched successfully');
      statusCode = STATUS_SUCCESS;
    } catch (err) {
      message.push('The services are not fetched successfully');
      statusCode = STATUS_FAILED;
    } finally {
      return {
        message,
        data,
        statusCode,
      };
    }
  }
  async disableService(
    serviceId: number,
    role: string,
    isDisable: number,
  ): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];
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

      let res = await this.serviceRepository.update(serviceId, { isDisable });
      if (res.affected > 0) {
        statusCode = STATUS_SUCCESS;
        message.push(
          `The service is ${
            isDisable == 1 ? 'disabled' : 'enabled'
          } successfully`,
        );
        data = [];
        return;
      }
      throw new Error('The status is not changed in the database');
    } catch (err) {
      statusCode = STATUS_FAILED;
      data = [];
      message.push(
        `The service is not ${isDisable == 1 ? 'disabled' : 'enabled'}`,
      );
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }
  async getServicesForAdmin(role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      data = [],
      message = [];
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

      let services = await this.serviceRepository.find({
        order: { sortOrder: 'ASC' },
      });
      if (services) {
        message.push('The services are successfully fetched');
        statusCode = STATUS_SUCCESS;
        data = services;
      } else {
        message.push('The services are no services present');
        data = [];
        statusCode = STATUS_FAILED;
      }
    } catch (error) {
      message.push('Unable to fetch the services');
      message.push(error.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }
  async changeSortOrder(serviceId: number, sortOrder: number,body:SortOrderDto) {
    let message = [],
      statusCode = STATUS_FAILED,
      data = [];
    try {

      let isAllowed = verifyRoleAccess({
        role:body.role,
        allowedRoles: [roleEnums.admin], 
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }
      let res = await this.serviceRepository.update(serviceId, { sortOrder });
      res= await this.serviceRepository.update(body.toBeReplacedId,{sortOrder:body.toBeReplacedSortOrder});
      if (res.affected > 0) {
        statusCode = STATUS_SUCCESS;
        message.push('The sortorder of service has been changed successfully');
        return;
      }
      throw new Error(
        'The sort order of service in the database is not updated',
      );
    } catch (error) {
      statusCode = STATUS_FAILED;
      message.push('The sortorder of service cannot be changed', error.message);
    } finally {
      return {
        statusCode,
        message,
        data,
      };
    }
  }
  async createService(body:CreateServiceDto)
  {
    let statusCode=STATUS_FAILED,message=[],data=[];
    try{

      let isAllowed = verifyRoleAccess({
        role:body.role,
        allowedRoles: [roleEnums.admin], 
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message = isAllowed.message;
        return;
      }

      let res=await this.serviceRepository.insert({
           name:body.name,
           sortOrder:body.sortOrder,
           type:body.type
      });
     if(res.raw.insertId>0)
     {
      statusCode=STATUS_SUCCESS;
      message.push("The service is created successfully");
      data=[];
      return;
     }
     
     throw new Error("The service is not been created in the database");

    }
    catch(error)
    { 

      message.push("The service is not created",error.message);
      statusCode=STATUS_FAILED;
 
    }
    finally{
return{
  message,
  statusCode,
  data
}
    }

  }
}
