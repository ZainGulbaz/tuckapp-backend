import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateTransactionDto } from './dtos/create.transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() body: CreateTransactionDto) {
    console.log(body);
    return await this.transactionService.createTransaction(body);
  }

  @Get('/admin')
  async getAdminTransaction(@Body() body: { role: string }) {
    return await this.transactionService.getAdminTransactions(body.role);
  }

  @Get('/driver')
  async getDriverTransaction(@Body() body: { role: string }) {
    return await this.transactionService.getDriverTransactions(body.role);
  }
}
