import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    {
      provide: 'TRANSACTION_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.BROKER_URL],
            queue: 'transaction-service',
            queueOptions: { durable: false },
          },
        }),
    },
  ],
})
export class TransactionModule {}
