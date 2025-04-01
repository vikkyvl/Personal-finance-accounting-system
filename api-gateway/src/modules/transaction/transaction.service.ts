import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError, throwError, firstValueFrom } from 'rxjs';

import { Transaction } from './dto/transaction';
import { patterns } from '../patterns';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @Inject('TRANSACTION_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  private send(pattern: any, data: any): Promise<unknown> {
    const res$ = this.client.send(pattern, data).pipe(
      timeout(30000),
      catchError((e: Error) => {
        this.logger.error(e.message);
        return throwError(() => e);
      }),
    );
    return firstValueFrom(res$);
  }

  async createTransaction(dto: Transaction) {
    this.logger.log('Creating transaction');
    return this.send(patterns.TRANSACTION.CREATE, dto);
  }

  async getTransactionsByUser(userId: string, type?: string, category?: string) {
    this.logger.log(`Getting transactions for user ${userId}`);
    return this.send(patterns.TRANSACTION.FIND_BY_USER, { userId, type, category });
  }

  async getSummary(userId: string) {
    this.logger.log(`Getting transaction summary for user ${userId}`);
    return this.send(patterns.TRANSACTION.SUMMARY, { userId });
  }
}

