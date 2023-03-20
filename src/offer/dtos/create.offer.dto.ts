import { IsNumber, IsOptional,IsString } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  rideId: number;

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsOptional()
  @IsString()
  role:string;

  @IsNumber()
  amount: number;
}
