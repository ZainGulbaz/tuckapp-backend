import { IsPhoneNumber, IsNumber } from 'class-validator';

export class driverLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNumber()
  otp: string;
}
