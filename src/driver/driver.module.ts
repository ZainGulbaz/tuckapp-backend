import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { UploadService } from './upload.service';
import { Driver } from './driver.entity';
import { Driver_Service } from './driver_service.entity';
import { Category } from 'src/category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Driver_Service, Category])],
  controllers: [DriverController],
  providers: [DriverService, UploadService],
})
export class DriverModule {}
