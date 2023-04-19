import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { UploadService } from './upload.service';
import { Driver } from './driver.entity';
import { Driver_Service } from './driver_service.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Driver_Service])],
  controllers: [DriverController],
  providers: [DriverService, UploadService],
})
export class DriverModule {}
