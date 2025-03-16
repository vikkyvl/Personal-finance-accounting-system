import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}

  @Post('register')
  async register(@Body() createUserDto: any) {
    return this.userService.send({ cmd: 'register_user' }, createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.userService.send({ cmd: 'login_user' }, loginDto);
  }
}

