import { IsPhoneNumber, IsNumber, IsString, IsEmail } from 'class-validator';

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

export class customerLoginDto {
  @IsEmail()
  email: string;

  @IsNumber()
  otp: number;
}
