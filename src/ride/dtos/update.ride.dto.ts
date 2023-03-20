import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRideDto {

  @IsOptional()
  @IsNumber()
  authId: number;

  @IsOptional()
  @IsString()
  role: string;
}
