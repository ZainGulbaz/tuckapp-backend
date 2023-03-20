import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { responseInterface } from 'src/utils/interfaces/response';
import { AcceptOfferDto } from './dtos/accept.offer.dto';
import { CreateOfferDto } from './dtos/create.offer.dto';
import { OfferService } from './offer.service';
@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}
  @Post()
  async createOffer(@Body() body: CreateOfferDto): Promise<responseInterface> {
    return await this.offerService.createOffer(body);
  }
  @Get(':rideId')
  async getAllOffers(
    @Param() param: { rideId: number },
    @Body() body: { role: string; authId: number },
  ): Promise<responseInterface> {
    return await this.offerService.getOffers(
      param.rideId,
      body.role,
      body.authId,
    );
  }
  @Post("accept")
  async acceptOffer(@Body() body: AcceptOfferDto): Promise<responseInterface> {
    return await this.offerService.acceptOffer(body);
  }
}
