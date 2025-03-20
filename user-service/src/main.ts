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
        urls: [configService.get('BROKER_URI')],
        queue: configService.get('USER_SERVICE_QUEUE'),
        queueOptions: { durable: false },
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  console.log('User-service is listening for messages on RabbitMQ');
  console.log(`Connected to queue: ${configService.get('USER_SERVICE_QUEUE')}`);

  await app.listen(configService.get<number>('PORT') || 4000);
  console.log(`User Service is running on port ${configService.get<number>('PORT') || 4000}`);
}
bootstrap();

