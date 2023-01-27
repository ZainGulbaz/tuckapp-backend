import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver/driver.entity';
@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async getDriver(id: number) {
    let user = await this.driverRepository.findOne({ where: [{ id: id }] });
    return user;
  }
}
