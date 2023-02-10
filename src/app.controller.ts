import { Controller, Get, Post, Param, Body } from '@nestjs/common';
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
    @Body() body: { role: string },
  ): Promise<responseInterface> {
    return await this.appService.generateOtp(params.id, body.role);
  }
}
