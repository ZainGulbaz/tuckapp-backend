import { IsString, IsBoolean, IsNumber, IsPhoneNumber } from 'class-validator';

export class createDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  driverPhoto: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  lisencePhoto: string;

  @IsString()
  lisencePlate: string;

  @IsString()
  gender: string;

  @IsNumber()
  dateOfBirth: number;

  @IsNumber()
  truckBedLength: number;

  @IsNumber()
  chargePerKm: number;
}
