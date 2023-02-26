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

  async validateDriver(id: number): Promise<boolean | string> {
    let isValidated: boolean | string = true;
    try {
      let driver = await this.driverRepository.findOne({ where: [{ id: id }] });
      if (!driver.isActive) {
        isValidated = 'The driver is not active';
      } else if (!driver.registrationStatus) {
        isValidated = 'The driver registration status is inactive';
      } else if (new Date().getTime() > driver.expiryDate) {
        isValidated = 'The driver registration has been expired';
      }
    } catch (err) {
      console.log(err);
    } finally {
      return isValidated;
    }
  }
}
