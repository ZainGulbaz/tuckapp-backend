import { IsNumber } from 'class-validator';

export class GetOffersDto {
  @IsNumber()
  rideId: number;

  @IsNumber()
  timer:number;
}
