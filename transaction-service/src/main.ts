import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice(
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('BROKER_URI')],
        queue: configService.get<string>('QUEUE_NAME') || 'transaction-service',
        queueOptions: { durable: false },
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  console.log('Transaction-service is listening for messages on RabbitMQ');
  console.log(
    `Connected to queue: ${configService.get<string>('QUEUE_NAME')}`,
  );

  await app.listen(configService.get<number>('PORT') || 3002);
  console.log(
    `Transaction Service is running on port ${configService.get<number>('PORT') || 3002}`,
  );
}
bootstrap();
