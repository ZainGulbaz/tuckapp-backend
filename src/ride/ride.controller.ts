import { Controller, Post, Body, Put, Query, Param, Get } from '@nestjs/common';
import { AllRidesDto } from './dtos/all.rides.dtos';
import { CreateRideDto } from './dtos/create.ride.dto';
import { RideService } from './ride.service';

@Controller('ride')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post()
  async createRide(@Body() body: CreateRideDto) {
    return await this.rideService.createRide(body);
  }

  @Get()
  async getAvailableRides(@Query() query: AllRidesDto, @Body() body: { role: string }) {
    return await this.rideService.getAvailableRides(query, body.role);
  }

  @Put('complete/:id')
  async completedRide(@Param() param: { id: number }, @Body() body: any) {
    return await this.rideService.completedRide(param.id, body);
  }

  @Put('assign/:id')
  async assignRide(
    @Param() param: { id: number },
    @Body() body: { authId: number,role:string },
  ) {
    return await this.rideService.assignRide(param.id, body.authId,body.role);
  }
}
