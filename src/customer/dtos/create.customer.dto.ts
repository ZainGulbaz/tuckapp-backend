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

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  uploadMessage: string;

  @IsOptional()
  @IsNumber()
  uploadStatusCode: number;
}
