import {
  Controller,
  Post,
  Body,
  Inject,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException, ConflictException
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}

  @Post('register')
  async register(@Body() createUserDto: any) {
    try {
      return await this.userService
          .send({ cmd: 'create_user' }, createUserDto)
          .toPromise();
    } catch (error: any) {
      const msg = error.message || error?.response?.message;

      if (msg === 'User already exists') {
        throw new ConflictException(msg);
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      return await this.userService.send({ cmd: 'login_user' }, loginDto).toPromise();
    } catch (err: any) {
      const message = err.message || err?.response?.message;

      if (message === 'User not found') {
        throw new NotFoundException(message);
      }
      if (message === 'Invalid password') {
        throw new UnauthorizedException(message);
      }

      throw new InternalServerErrorException('Login failed');
    }
  }

  @Post('reset-request')
  async resetRequest(@Body() body: { email: string }) {
    console.log('Sending reset request for email:', body.email);

    try {
      const result = await this.userService
          .send({ cmd: 'request_password_reset' }, body.email)
          .toPromise();

      console.log('Reset result:', result);
      return result;
    } catch (err: any) {
      console.error('FULL ERROR:', JSON.stringify(err, null, 2));

      const message =
          err?.response?.data?.message ||
          err?.response?.message ||
          err?.message ||
          'Unknown error';

      console.error('Reset request error:', message);

      if (message === 'User not found') {
        throw new NotFoundException(message);
      }

      throw new InternalServerErrorException('Reset request failed');
    }
  }

  @Post('reset-confirm')
  async resetConfirm(@Body() body: { token: string; newPassword: string }) {
    console.log('Confirming password reset with token:', body.token);
    return this.userService
        .send({ cmd: 'reset_password_confirm' }, { token: body.token, newPassword: body.newPassword })
        .toPromise();
  }
}
  
  
  
