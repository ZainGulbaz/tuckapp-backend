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
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  serviceId: number;
}
