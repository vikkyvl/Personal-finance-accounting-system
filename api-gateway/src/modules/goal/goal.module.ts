import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'GOAL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.BROKER_URL || 'amqp://guest:guest@localhost:5672'],
          queue: process.env.GOAL_SERVICE_QUEUE || 'goal-service',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [GoalController],
  providers: [GoalService],
})
export class GoalModule {}
