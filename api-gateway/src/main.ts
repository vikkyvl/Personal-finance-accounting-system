import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const rabbitMQUrl = configService.get<string>('BROKER_URL');
  const queueName = configService.get<string>('USER_SERVICE_QUEUE');
  const port = configService.get<number>('PORT') || 3000;

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMQUrl],
      queue: queueName,
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`API Gateway is running on http://localhost:${port}`);
}
bootstrap();
