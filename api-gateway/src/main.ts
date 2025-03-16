import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.BROKER_URL || 'amqp://guest:guest@localhost:5672'],
      queue: process.env.USER_SERVICE_QUEUE || 'user-service',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
  console.log(`API Gateway is running on port ${process.env.PORT || 3000}`);
}

bootstrap();
