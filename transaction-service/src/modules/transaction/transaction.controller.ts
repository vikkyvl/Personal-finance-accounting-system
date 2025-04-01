import { Controller, Post, Body, Get, Param, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';
import { TransactionDTO } from './dto/transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransactionHttp(@Body() dto: TransactionDTO) {
    return this.transactionService.createTransaction(dto);
  }

  @Get(':userId')
  async getTransactionsHttp(
    @Param('userId') userId: string,
    @Query('type') type?: 'income' | 'expense',
    @Query('category') category?: string,
  ) {
    return this.transactionService.getTransactions(userId, { type, category });
  }

  @Get(':userId/summary')
  async getSummaryHttp(@Param('userId') userId: string) {
    const transactions = await this.transactionService.getTransactions(userId);
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(@Param('id') id: string) {
    await this.transactionService.deleteTransaction(id);
  }

  @MessagePattern({ cmd: 'create_transaction' })
  async createTransactionRMQ(dto: TransactionDTO) {
    return this.transactionService.createTransaction(dto);
  }

  @MessagePattern({ cmd: 'get_transactions_by_user' })
  async getTransactionsRMQ(payload: {
    userId: string;
    type?: 'income' | 'expense';
    category?: string;
  }) {
    const { userId, type, category } = payload;
    return this.transactionService.getTransactions(userId, { type, category });
  }

  @MessagePattern({ cmd: 'get_summary' })
  async getSummaryRMQ(data: { userId: string }) {
    const transactions = await this.transactionService.getTransactions(data.userId);
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense };
  }
}
