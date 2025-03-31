import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './modules/transaction/transaction.module';
import { GoalModule } from './modules/goal/goal.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TransactionModule,
    GoalModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.BROKER_URL || 'amqp://guest:guest@localhost:5672'],
          queue: process.env.USER_SERVICE_QUEUE || 'user-service',
          queueOptions: { durable: false },
        },
      },
    ]),       
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



