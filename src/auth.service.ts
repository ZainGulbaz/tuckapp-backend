import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver/driver.entity';
import { Admin } from './admin/admin.entity';
@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async getDriver(id: number) {
    let user = await this.driverRepository.findOne({ where: [{ id: id }] });
    return user;
  }

  async getAdmin(id: number) {
    let user = await this.adminRepository.findOne({ where: [{ id: id }] });
    return user;
  }
}
