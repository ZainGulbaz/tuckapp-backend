import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRideDto {
  @IsString()
  startLocation: string;

  @IsString()
  endLocation: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsNumber()
  amount: number;
}
