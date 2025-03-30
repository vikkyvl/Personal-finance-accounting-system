import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmModuleOptions } from './config/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      ...typeOrmModuleOptions,
      entities: [__dirname + '/../../entities/*.entity.{ts,js}'],
      migrations: [__dirname + '/../../migrations/*.{ts,js}'],
    }),
  ],
})
export class OrmModule {}
