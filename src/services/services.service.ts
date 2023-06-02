import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './services.entity';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { responseInterface } from 'src/utils/interfaces/response';

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
      let allservices = await this.serviceRepository.query(`Select CONCAT('[',GROUP_CONCAT(JSON_OBJECT(id,name)),']') services,type from service Group BY type`);
      data = allservices;
      console.log(data);
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
}
