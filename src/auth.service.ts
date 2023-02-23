import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver/driver.entity';
import { Admin } from './admin/admin.entity';
import { Customer } from './customer/customer.entity';
@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async getDriver(id: number) {
    let user = await this.driverRepository.findOne({ where: [{ id: id }] });
    return user;
  }

  async getAdmin(id: number) {
    let user = await this.adminRepository.findOne({ where: [{ id: id }] });
    return user;
  }

  async getCustomer(id: number) {
    let user = await this.customerRepository.findOne({ where: [{ id: id }] });
    return user;
  }
}
