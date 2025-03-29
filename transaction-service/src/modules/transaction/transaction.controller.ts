import { Controller, Post, Body, Get, Param, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionDTO } from './dto/transaction.dto';
  
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() dto: TransactionDTO) {
    return this.transactionService.createTransaction(dto);
  }

  @Get(':userId')
  async getTransactions(@Param('userId') userId: string, @Query('type') type?: 'income' | 'expense', @Query('category') category?: string) {
    return this.transactionService.getTransactions(userId, { type, category });
  }

  @Get(':userId/summary')
  async getSummary(@Param('userId') userId: string) {
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
}