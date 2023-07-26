import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
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

  @Get('/appversion')
  async getAppVersion(@Query() query:{type:string}){
    return await this.appService.getAppVersions(query.type);
  }

  @Get('/google/directions')
  async getGoogleRoutes(@Query() query:{origin:string,destination:string}){
    return await this.appService.getGoogleRoutes(query.origin,query.destination);
  }
}
