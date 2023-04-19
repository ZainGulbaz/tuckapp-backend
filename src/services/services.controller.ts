import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';
import { responseInterface } from 'src/utils/interfaces/response';

@Controller('services')
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  async getService(): Promise<responseInterface> {
    return await this.services.getAllServices();
  }
}
