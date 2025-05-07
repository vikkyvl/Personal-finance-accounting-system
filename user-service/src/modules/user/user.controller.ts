/* import { Logger, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { UserService } from './user.service';
import { UserDTO } from './dto';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(dto: UserDTO) {
    console.log('Received user creation request:', dto);
    this.logger.log(`Processing user creation for: ${JSON.stringify(dto)}`);
    return this.userService.createUser(dto);
  }

  @MessagePattern({ cmd: 'find_all_users' })
  async findAllUsers() {
    return this.userService.findAllUsers();
  }

  @MessagePattern({ cmd: 'find_user_by_id' })
  async findUserById(id: string) {
    return this.userService.findUserById(id);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(id: string, dto: UserDTO) {
    return this.userService.updateUser(id, dto);
  }

  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(id: string) {
    return this.userService.deleteUser(id);
  }

  @MessagePattern({ cmd: 'find_user_by_email' })
  async findUserByEmail(email: string) {
    return this.userService.findUserByEmail(email);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(email: string) {
    return this.userService.resetPassword(email);
  }
} */
import { Logger, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { UserService } from './user.service';
import { UserDTO } from './dto';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(dto: UserDTO) {
    console.log('User-service received create_user request:', dto);
    this.logger.log(`Processing user creation for: ${JSON.stringify(dto)}`);
    return this.userService.createUser(dto);
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(dto: { email: string; password: string }) {
    console.log('Received login request:', dto);
    return this.userService.login(dto);
  }

  @MessagePattern({ cmd: 'request_password_reset' })
  async handleResetRequest(email: string) {
    return this.userService.requestPasswordReset(email);
  }

  @MessagePattern({ cmd: 'reset_password_confirm' })
  async resetPasswordConfirm(dto: { token: string; newPassword: string }) {
    return this.userService.resetPasswordConfirm(dto.token, dto.newPassword);
  }
}


