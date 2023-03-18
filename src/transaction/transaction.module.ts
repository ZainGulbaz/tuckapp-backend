import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Driver } from 'src/driver/driver.entity';
import { TransactionHelperService } from './transaction.helper.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, TransactionHelperService],
  imports: [TypeOrmModule.forFeature([Transaction, Driver])],
})
export class TransactionModule {}
