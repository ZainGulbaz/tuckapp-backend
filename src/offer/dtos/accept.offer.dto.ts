import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AcceptOfferDto {
  @IsNumber()
  offerId: number;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  authId: number;
}
