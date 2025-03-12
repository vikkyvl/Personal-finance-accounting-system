import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pack = require('./../package.json');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.BROCKER_URI],
      queue: pack.name,
      queueOptions: { durable: false },
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();