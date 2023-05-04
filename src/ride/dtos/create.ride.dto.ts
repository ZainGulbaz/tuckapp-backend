import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRideDto {
  @IsString()
  startLocation: string;

  @IsOptional()
  @IsString()
  endLocation: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  categories: string;

  @IsOptional()
  @IsString()
  services: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
  
}
