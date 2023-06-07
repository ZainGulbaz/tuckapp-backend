import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './ride.entity';
import { Driver } from 'src/driver/driver.entity';
import { Customer } from 'src/customer/customer.entity';
import { Transaction } from 'src/transaction/transaction.entity';
import { Ride_Service } from './ride-services.entity';
import { Ride_Category } from './ride-categories.entity';
import { Offer } from 'src/offer/offer.entity';
import { RideService } from './ride.service';
import { PushNotifyService } from './pushnotify.service';
import { RideHelperService } from './ride.helper.service';
@Module({
  controllers: [RideController],
  providers: [RideService, PushNotifyService, RideHelperService],
  imports: [
    TypeOrmModule.forFeature([
      Ride,
      Driver,
      Transaction,
      Customer,
      Ride_Service,
      Ride_Category,
      Offer
    ]),
  ],
})
export class RideModule {}
