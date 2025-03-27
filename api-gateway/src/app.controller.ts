  import { Controller, Post, Body, Inject } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  
  @Controller('users')
  export class AppController {
    constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}
  
    @Post('register')
    async register(@Body() createUserDto: any) {
      console.log('Sending message to user-service:', createUserDto);
      try {
        const response = await this.userService
          .send({ cmd: 'create_user' }, createUserDto)  
          .toPromise();
  
        console.log('Received response from user-service:', response);
        return response;
      } catch (error) {
        console.error('Error during registration:', error.message || error);
        throw error;
      }
    }

    @Post('login')
    async login(@Body() loginDto: { email: string; password: string }) {
      console.log('Forwarding login request to user-service:', loginDto);
      return this.userService.send({ cmd: 'login_user' }, loginDto).toPromise();
    } 
  }
  
  
  
