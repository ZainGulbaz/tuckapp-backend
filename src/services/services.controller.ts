import {  Controller, Get,Put,Post,Param,Body,Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { responseInterface } from 'src/utils/interfaces/response';
import { SortOrderDto } from './dtos/sort.order.service.dto';
import { CreateServiceDto } from './dtos/create.service.dto';

@Controller('services')
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  async getService(): Promise<responseInterface> {
    return await this.services.getAllServices();
  }

  @Post() 
  async creatreService(@Body() body:CreateServiceDto):Promise<responseInterface>{
    return this.services.createService(body);

  }

  @Put("disable/:serviceId")
  async disableService(@Param() params:{serviceId:number}, @Query() query:{isDisable:number},@Body() body:{role:string}) {
    return await this.services.disableService(params.serviceId,body.role,query.isDisable);
  }

  @Put("sortorder/:serviceId")
  async changeSortOrder(@Param() params:{serviceId:number},@Query() query:{sortOrder:number},@Body() body:SortOrderDto)
  {
    return await this.services.changeSortOrder(params.serviceId,query.sortOrder,body);
  }

  @Get("admin")
  async getServicesForAdmin(@Body() body:{role:string}):Promise<responseInterface>{
    return await this.services.getServicesForAdmin(body.role);
  }
}
