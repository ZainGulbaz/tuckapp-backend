import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { Ride } from 'src/ride/ride.entity';

@Module({
  controllers: [OfferController],
  providers: [OfferService],
  imports: [TypeOrmModule.forFeature([Offer, Ride])],
})
export class OfferModule {}
