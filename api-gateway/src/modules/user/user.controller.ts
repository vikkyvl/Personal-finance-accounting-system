import {
  Controller,
  Logger,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';

import { UserService } from './user.service';
import { User } from './dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() user: User) {
    this.logger.log('Creating user');
    return this.userService.createUser(user);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    this.logger.log(`User login attempt: ${loginDto.email}`);
    return this.userService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('reset-request')
  async resetRequest(@Body() body: { email: string }) {
    return this.userService.resetRequest(body.email);
  }

  @Post('reset-confirm')
  async resetConfirm(@Body() body: { token: string; newPassword: string }) {
    return this.userService.confirmPasswordResetByToken(body.token, body.newPassword);
  }

}

