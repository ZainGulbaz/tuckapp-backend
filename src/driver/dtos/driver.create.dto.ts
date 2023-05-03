import {
  IsString,
  IsOptional,
  IsNumber,
  IsPhoneNumber,
  IsUUID,
} from 'class-validator';

export class createDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  truckPhoto: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  lisencePhoto: string;

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

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  chargePerKm: number;

  @IsOptional()
  @IsUUID()
  oneSignalToken: string;

  @IsOptional()
  @IsString()
  services: string;
}
