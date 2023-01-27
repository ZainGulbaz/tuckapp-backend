import { Controller, Post, Get, Param } from '@nestjs/common';
import { Body, Delete, Put } from '@nestjs/common/decorators';
import { DriverService } from './driver.service';
import { createDriverDto } from './dtos/driver.create.dto';
import { updateDriverDto } from './dtos/driver.update.dto';

@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post()
  async createDriver(@Body() body: createDriverDto) {
    return await this.driverService.createDriver(body);
  }

  @Get()
  async getAllDrivers() {
    return await this.driverService.getAllDrivers();
  }

  @Get(':id')
  async getDriver(@Param() params: { id: number }) {
    return await this.driverService.getDriver(params.id);
  }

  @Delete(':id')
  async deleteDriver(@Param() params: { id: number }) {
    return await this.driverService.deleteDriver(params.id);
  }

  @Put(':id')
  async updateDriver(
    @Param() params: { id: number },
    @Body() body: updateDriverDto,
  ) {
    return await this.driverService.updateDriver(params.id, body);
  }
}
