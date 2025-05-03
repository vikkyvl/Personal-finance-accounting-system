import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { TransactionDTO } from './dto/transaction.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class TransactionService {
  constructor(
      @InjectRepository(Transaction)
      private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(dto: TransactionDTO): Promise<Transaction> {
    const transaction = this.transactionRepository.create(dto);
    return await this.transactionRepository.save(transaction);
  }

  async getTransactions(userId: string, filters?: {
    type?: 'income' | 'expense';
    category?: string;
  }): Promise<Transaction[]> {
    const query = this.transactionRepository.createQueryBuilder('transaction')
        .where('transaction.user_id = :userId', { userId });

    if (filters?.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters?.category) {
      query.andWhere('transaction.category = :category', { category: filters.category });
    }

    return await query.orderBy('transaction.transaction_date', 'DESC').getMany();
  }

  async deleteTransaction(id: string): Promise<void> {
    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
  }
}

