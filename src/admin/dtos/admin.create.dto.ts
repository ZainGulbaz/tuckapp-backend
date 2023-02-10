import { IsString } from 'class-validator';

export class adminCreateDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  country: string;

  @IsString()
  city: string;
}
