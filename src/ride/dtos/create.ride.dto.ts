import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRideDto {
  @IsString()
  startLocation: string;

  @IsString()
  endLocation: string;

  @IsNumber()
  startTime: number;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  authId: number;
}
