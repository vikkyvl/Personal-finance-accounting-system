import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}

  @Get()
  async getUsers() {
    return this.userService.send({ cmd: 'get_users' }, {});
  }
}
