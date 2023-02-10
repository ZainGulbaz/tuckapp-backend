import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
} from '@nestjs/common';
import { Delete, Put, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
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
  async getAllDrivers(@Body() body: { role: string }) {
    return await this.driverService.getAllDrivers(body.role);
  }

  @Get(':id')
  async getDriver(
    @Param() params: { id: number },
    @Body() body: { role: string },
  ) {
    return await this.driverService.getDriver(params.id, body.role);
  }

  @Delete(':id')
  async deleteDriver(
    @Param() params: { id: number },
    @Body() body: { role: string },
  ) {
    return await this.driverService.deleteDriver(params.id, body.role);
  }

  @Put(':id')
  async updateDriver(
    @Param() params: { id: number },
    @Body() body: updateDriverDto,
  ) {
    return await this.driverService.updateDriver(params.id, body);
  }

  @Post('photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = `${uuidv4()}`;
          callback(null, filename);
        },
      }),
    }),
  )
  handleUpload(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return 'File upload API';
  }
}
