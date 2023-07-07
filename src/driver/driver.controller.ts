import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Delete, Put, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { DriverService } from './driver.service';
import { UploadService } from './upload.service';
import { createDriverDto } from './dtos/driver.create.dto';
import { updateDriverDto } from './dtos/driver.update.dto';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';

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
    @Body() body: { role: string; authId: number },
  ) {
    return await this.driverService.getDriver(
      params.id,
      body.role,
      body.authId,
    );
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
          req.body.fileName = '';
          req.body.message = 'Unsupported image format';
          req.body.statusCode = STATUS_FAILED;
          callback(null, false);
        } else callback(null, true);
      },
      storage: diskStorage({
        destination: './client/uploads/driver/truck/',
        filename: (req, file, callback) => {
          const { originalname } = file;
          const filename = `${uuidv4()}${originalname.slice(
            originalname.lastIndexOf('.'),
          )}`;
          req.body.fileName = filename;
          req.body.message = 'The Truck image is uploaded successfully';
          req.body.statusCode = STATUS_SUCCESS;
          callback(null, filename);
        },
      }),
    }),
  )
  handleTruckPhotoUpload(
    @Body() body: { fileName?: string; message: string; statusCode: number },
  ) {
    return this.uploadService.handleTruckPhotoUpload(body);
  }

  @Post('photo/lisence')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5000000 },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          req.body.fileName = '';
          req.body.message = 'Unsupported image format';
          req.body.statusCode = STATUS_FAILED;
          callback(null, false);
        } else callback(null, true);
      },
      storage: diskStorage({
        destination: './client/uploads/driver/lisence/',
        filename: (req, file, callback) => {
          const { originalname } = file;
          const filename = `${uuidv4()}${originalname.slice(
            originalname.lastIndexOf('.'),
          )}`;
          req.body.fileName = filename;
          req.body.message = 'The lisence image is uploaded successfully';
          req.body.statusCode = STATUS_SUCCESS;
          callback(null, filename);
        },
      }),
    }),
  )
  handleLisencePhotoUpload(
    @Body() body: { fileName?: string; message: string; statusCode: number },
  ) {
    return this.uploadService.handleLisencePhotoUpload(body);
  }

  @Put('location/:coordinates')
  async updateCoordinates(
    @Param() params: { coordinates: string },
    @Body() body: { authId: number },
  ) {
    return this.driverService.updateCoordinates(
      params.coordinates,
      body.authId,
    );
  }

  @Put('chat/:status')
  async driverOnChat(
    @Param() params: { status: string },
    @Body()
    body: {
      authId: number;
      role: string;
    },
  ) {
    return await this.driverService.driverOnChat(
      body.authId,
      params.status,
      body.role,
    );
  }

  @Get("/distance/ride")
  async distance(@Body() body:{role:string,authId:number}){
  return await this.driverService.distance(body.authId,body.role);
  }

  @Get("/location/:driverId")
  async getLocation(@Param() params:{driverId:number},@Body() body:{role:string,authId:number}){
    return await this.driverService.getLocation(params.driverId,body.role);
  }
}
