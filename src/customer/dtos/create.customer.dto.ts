import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  uploadMessage: string;

  @IsOptional()
  @IsNumber()
  uploadStatusCode: number;
}
