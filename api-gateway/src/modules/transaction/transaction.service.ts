import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTransactionDto } from './dto/transaction';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TRANSACTION_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  createTransaction(data: any) {
    // мапимо camelCase → snake_case
    const mapped = {
      user_id: data.userId,
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      transaction_date: data.transactionDate,
    };
  
    return this.client.send({ cmd: 'create_transaction' }, mapped).toPromise();
  }  

  getTransactionsByUser(userId: string, type?: string, category?: string) {
    return this.client
      .send({ cmd: 'get_transactions_by_user' }, { userId, type, category })
      .toPromise();
  }

  getSummary(userId: string) {
    return this.client
      .send({ cmd: 'get_summary' }, { userId })
      .toPromise();
  }
}
