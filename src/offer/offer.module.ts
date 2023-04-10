import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { Ride } from 'src/ride/ride.entity';
import { Driver } from 'src/driver/driver.entity';

@Module({
  controllers: [OfferController],
  providers: [OfferService],
  imports: [TypeOrmModule.forFeature([Offer, Ride, Driver])],
})
export class OfferModule {}
