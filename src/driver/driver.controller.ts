import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { Delete, Put, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { DriverService } from './driver.service';
import { UploadService } from './upload.service';
import { createDriverDto } from './dtos/driver.create.dto';
import { updateDriverDto } from './dtos/driver.update.dto';

@Controller('driver')
export class DriverController {
  constructor(
    private driverService: DriverService,
    private uploadService: UploadService,
  ) {}

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

  @Post('photo/truck')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5000000 },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return {
            statusCode: 404,
            messages: 'The image format is not supported',
          };
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: './client/uploads/driver/truck/',
        filename: (req, file, callback) => {
          const { originalname } = file;
          const filename = `${uuidv4()}${originalname.slice(
            originalname.lastIndexOf('.'),
          )}`;
          callback(null, filename);
          req.body.fileName = filename;
        },
      }),
    }),
  )
  handleTruckPhotoUpload(@Body() body: { fileName: string }) {
    return this.uploadService.handleTruckPhotoUpload(body.fileName);
  }

  @Post('photo/lisence')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5000000 },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return {
            statusCode: 404,
            messages: 'The image format is not supported',
          };
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: './client/uploads/driver/lisence/',
        filename: (req, file, callback) => {
          const { originalname } = file;
          const filename = `${uuidv4()}${originalname.slice(
            originalname.lastIndexOf('.'),
          )}`;
          callback(null, filename);
          req.body.fileName = filename;
        },
      }),
    }),
  )
  handleLisencePhotoUpload(@Body() body: { fileName: string }) {
    return this.uploadService.handleLisencePhotoUpload(body.fileName);
  }
}
