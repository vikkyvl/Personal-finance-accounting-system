import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}

  @Post('register')
  async registerUser(@Body() data: { username: string; password: string; role: string }) {
    return firstValueFrom(this.userService.send({ cmd: 'create_user' }, data));
  }
}