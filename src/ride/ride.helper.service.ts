import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'src/transaction/transaction.entity';
@Injectable()
export class RideHelperService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createRideTransaction(body: {
    customerId: number;
    rideId: number;
    amount: number;
  }) {
    try {
      let transaction = await this.transactionRepository.insert({
        ...body,
        time: new Date().getTime(),
      });
      if (transaction.raw.affectedRows > 0) {
        return transaction.identifiers[0].id;
      } else {
        throw new Error('Failed Transaction');
      }
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  }
}
