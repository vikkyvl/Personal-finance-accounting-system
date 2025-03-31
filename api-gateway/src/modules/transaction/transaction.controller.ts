import {
    Controller,
    Post,
    Get,
    Param,
    Query,
    Body,
    Inject,
  } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  
  @Controller('transactions')
  export class TransactionController {
    constructor(
      @Inject('TRANSACTION_SERVICE')
      private readonly transactionService: ClientProxy,
    ) {}
  
    @Post()
    async createTransaction(@Body() data: any) {
      return this.transactionService
        .send({ cmd: 'create_transaction' }, data)
        .toPromise();
    }
  
    @Get(':userId')
    async getUserTransactions(
      @Param('userId') userId: string,
      @Query('type') type?: string,
      @Query('category') category?: string,
    ) {
      return this.transactionService
        .send({ cmd: 'get_transactions_by_user' }, { userId, type, category })
        .toPromise();
    }
  
    @Get(':userId/summary')
    async getSummary(@Param('userId') userId: string) {
      return this.transactionService
        .send({ cmd: 'get_summary' }, { userId })
        .toPromise();
    }
  }
  