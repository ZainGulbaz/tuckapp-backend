import { Injectable, Logger } from '@nestjs/common';
import 'dotenv/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from '../driver/driver.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionHelperService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  async updateDriverExpiry(body: { driverExpiry: number; id: number }) {
    try {
      const { id, driverExpiry } = body;
      console.log('Driver Expiry', driverExpiry);
      const res = await this.driverRepository.update(id, {
        expiryDate: driverExpiry,
      });
      if (res.affected > 0) {
        return 'The driver expiry date is updated successfully';
      }
    } catch (err) {
      throw new Error('The driver expiry date cannot be updated');
    }
  }

}
