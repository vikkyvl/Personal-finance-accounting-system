import { Module } from '@nestjs/common';
import { OrmModule } from './orm/orm.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [OrmModule, TransactionModule],
})
export class ModulesModule {}
