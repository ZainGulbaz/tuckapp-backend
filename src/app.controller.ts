import { Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { responseInterface } from './utils/interfaces/response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('generate/otp/:id')
  async generateOtp(
    @Param() params: { id: number },
  ): Promise<responseInterface> {
    return this.appService.generateOtp(params.id);
  }
}
