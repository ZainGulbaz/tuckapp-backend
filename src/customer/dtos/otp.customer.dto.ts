import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CustomerOtpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role: string;
}
