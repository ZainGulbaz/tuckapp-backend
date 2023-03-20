import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  role: string;

  @IsNumber()
  driverExpiry: number;

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsNumber()
  driverId: number;
}
