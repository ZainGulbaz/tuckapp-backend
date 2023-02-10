import { IsPhoneNumber, IsNumber, IsString } from 'class-validator';

export class driverLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNumber()
  otp: string;
}

export class adminLoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
