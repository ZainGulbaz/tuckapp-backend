import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRideDto {
  @IsNumber()
  endTime: number;

  @IsString()
  transactionId: string;

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsOptional()
  @IsString()
  role: string;
}
