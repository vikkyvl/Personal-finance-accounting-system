/* import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}

  @Post('register')
  async register(@Body() createUserDto: any) {
    console.log('Received registration request:', createUserDto);
    try {
      const response = await this.userService.send({ cmd: 'create_user' }, createUserDto).toPromise();
      console.log('Response from user-service:', response);
      return response;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.userService.send({ cmd: 'login_user' }, loginDto);
  }
} */
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
  
  
/*   import { Controller, Get } from '@nestjs/common';

  @Controller()
  export class AppController {
    @Get()
    getHello(): string {
      return "Hello World!";
    }
  } */
  
  
