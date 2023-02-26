import { Injectable } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { responseInterface } from 'src/utils/interfaces/response';
import { STATUS_FAILED, STATUS_SUCCESS } from 'src/utils/codes';
import {
  removeKeysFromBody,
  verifyRoleAccess,
} from 'src/utils/commonfunctions';
import { checkKeys } from 'src/utils/commonfunctions';
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
      let isAllowed = verifyRoleAccess({
        role: body.role,
        allowedRoles: [roleEnums.admin, roleEnums.driver],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let transactionObj: any = body;
      if (body.role == roleEnums.admin) {
        transactionObj.adminId = body.authId;
        removeKeysFromBody(['role', 'authId'], transactionObj);
        if (
          checkKeys(['adminId', 'time', 'amount', 'driverId'], transactionObj)
        )
          throw new Error('Incorrect Parameters');
      } else if (body.role == roleEnums.driver) {
        
        transactionObj.driverId = body.authId;
        removeKeysFromBody(['role', 'authId'], transactionObj);
        if (
          checkKeys(
            ['customerId', 'time', 'amount', 'driverId', 'rideId'],
            transactionObj,
          )
        )
          throw new Error('Incorrect Parameters');
      }

      let transaction = await this.transactionRepository.insert(transactionObj);
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

  async getAdminTransactions(role: string): Promise<responseInterface> {
    let messages = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let transactions = await this.transactionRepository.query(
        'SELECT tx.id id,dr.id driverId,tx.amount amount, tx.time time,dr.firstName firstName, dr.lastName lastName, dr.phoneNumber phoneNumber, dr.city city, dr.country country FROM transaction tx JOIN driver dr ON dr.id=tx.driverId ORDER BY tx.time desc ',
      );

      messages.push('The Admin Transactions are successfully fetched');
      statusCode = STATUS_SUCCESS;
      data = transactions;
    } catch (err) {
      console.log(err);
      messages.push('The Admin Transactions was not fetched');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        messages,
        statusCode,
        data,
      };
    }
  }

  async getDriverTransactions(role: string): Promise<responseInterface> {
    let messages = [],
      statusCode = STATUS_SUCCESS,
      data = [];
    try {
      let isAllowed = verifyRoleAccess({
        role: role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        messages = isAllowed.messages;
        return;
      }

      let transactions = await this.transactionRepository.query(
        'SELECT tx.id id,cu.id customerId,tx.rideId rideId,dr.id driverId ,tx.amount amount, tx.time time,cu.firstName customerFirstName, cu.lastName customerLastName, cu.phoneNumber customerPhoneNumber,dr.phoneNumber driverPhoneNumber,dr.firstName driverFirstName, dr.lastName driverLastName  FROM transaction tx JOIN Customer cu ON cu.id=tx.customerId JOIN Driver dr ON dr.id=tx.driverId ORDER BY tx.time desc ',
      );

      messages.push('The Driver Transactions are successfully fetched');
      statusCode = STATUS_SUCCESS;
      data = transactions;
    } catch (err) {
      console.log(err);
      messages.push('The Driver Transactions was not fetched');
      messages.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        messages,
        statusCode,
        data,
      };
    }
  }
}
