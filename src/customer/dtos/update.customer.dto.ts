import { IsOptional, IsString ,IsNumber} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

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
  role: string;

  @IsOptional()
  @IsNumber()
  authId:number;
}
