import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class updateDriverDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  truckPhoto: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  lisencePhoto: string;

  @IsOptional()
  @IsString()
  lisencePlate: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsNumber()
  dateOfBirth: number;

  @IsOptional()
  @IsNumber()
  truckBedLength: number;

  @IsOptional()
  @IsNumber()
  chargePerKm: number;

  @IsOptional()
  @IsBoolean()
  registerationStatus: boolean;

  @IsOptional()
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsString()
  services: string;

  @IsString()
  role: string;

  @IsNumber()
  authId: number;
}
