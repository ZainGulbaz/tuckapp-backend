import { Controller, Post, Body, Put, Query, Param, Get } from '@nestjs/common';
import { responseInterface } from 'src/utils/interfaces/response';
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
  async getAvailableRides(
    @Query() query: AllRidesDto,
    @Body() body: { role: string; authId: number },
  ) {
    return await this.rideService.getAvailableRides(
      query,
      body.role,
      body.authId,
    );
  }

  @Put('complete/:id')
  async completedRide(@Param() param: { id: number }, @Body() body: any) {
    return await this.rideService.completedRide(param.id, body);
  }

  @Put('assign/:id')
  async assignRide(
    @Param() param: { id: number },
    @Body() body: { authId: number; role: string },
  ) {
    return await this.rideService.assignRide(param.id, body.authId, body.role);
  }

  @Get('all')
  async getAllRides(
    @Body() body: { role: string },
  ): Promise<responseInterface> {
    return await this.rideService.getAllRides(body.role);
  }

  @Get('current')
  async getCurrentRide(@Body() body: { role: string; authId: number }) {
    return this.rideService.getCurrentRide(body.authId,body.role);
  }
}
