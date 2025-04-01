import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

@Module({
  controllers: [GoalController],
  providers: [
    GoalService,
    {
      provide: 'GOAL_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.BROKER_URL],
            queue: 'goal-service',
            queueOptions: { durable: false },
          },
        }),
    },
  ],
})
export class GoalModule {}

