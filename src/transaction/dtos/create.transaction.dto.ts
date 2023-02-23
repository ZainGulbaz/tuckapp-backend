import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  time: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  rideId: number;

  @IsOptional()
  @IsNumber()
  driverId: number;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsNumber()
  adminId: number;

  @IsOptional()
  @IsString()
  role: string;
}
