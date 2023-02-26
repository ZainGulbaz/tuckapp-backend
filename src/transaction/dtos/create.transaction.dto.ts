import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber({})
  time: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  rideId: number;

  @IsOptional()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  authId: number;
}
