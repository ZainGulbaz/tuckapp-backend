import { Injectable } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { responseInterface } from 'src/utils/interfaces/response';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import { verifyRoleAccess } from 'src/utils/commonfunctions';
import { CreateTransactionDto } from './dtos/create.transaction.dto';
import { roleEnums } from 'src/utils/enums';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}
  async createTransaction(
    body: CreateTransactionDto,
  ): Promise<responseInterface> {
    let messages = [],
      statusCode = STATUS_SUCCESS,
      data = [];

    try {
      if (
        !(body.role==roleEnums.driver && body.driverId && body.customerId && body.rideId) &&
        !(body.role==roleEnums.admin && body.adminId && body.driverId)
      )
        throw new Error('Incorrect Parameters');

      let isAllowed = verifyRoleAccess({
        role: body.role,
        allowedRoles: [roleEnums.admin, roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      delete body.role;
      let transaction = await this.transactionRepository.insert(body);
      if (transaction.raw.affectedRows > 0) {
        messages.push('The transaction was successfull');
        statusCode = STATUS_SUCCESS;
      } else {
        throw new Error('Unable to create transaction');
      }
    } catch (err) {
      messages.push('The transaction was not created successfully');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        messages,
        data,
      };
    }
  }
}
