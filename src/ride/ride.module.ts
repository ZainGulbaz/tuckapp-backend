import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './ride.entity';
import { Driver } from 'src/driver/driver.entity';
import { Customer } from 'src/customer/customer.entity';
import { Transaction } from 'src/transaction/transaction.entity';
import { RideService } from './ride.service';
import { PushNotifyService } from './pushnotify.service';
import { RideHelperService } from './ride.helper.service';
@Module({
  controllers: [RideController],
  providers: [RideService, PushNotifyService, RideHelperService],
  imports: [TypeOrmModule.forFeature([Ride, Driver,Transaction,Customer])],
})
export class RideModule {}