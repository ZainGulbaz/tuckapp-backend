import { Controller, Post,Body } from '@nestjs/common';
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
}
