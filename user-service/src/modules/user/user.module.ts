import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';

import { User } from '../../entity/user.entity';//entities
import { Role } from '../../entity/role.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}