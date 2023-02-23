import { Module } from '@nestjs/common';
import { RideController } from './ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './ride.entity';
import { RideService } from './ride.service';
@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [TypeOrmModule.forFeature([Ride])],
})
export class RideModule {}
