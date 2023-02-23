import { IsString } from 'class-validator';

export class AllRidesDto {
  @IsString()
  radius: string;

  @IsString()
  coordinates: string;
}
