import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRideDto {
  @IsNumber()
  endTime: number;
  @IsNumber()
  transactionId: number;

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsOptional()
  @IsString()
  role: string;
}
