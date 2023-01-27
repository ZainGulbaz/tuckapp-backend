import {
  IsString,
  IsBoolean,
  IsNumber,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';

export class updateDriverDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  driverPhoto: string;

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
}
