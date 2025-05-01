import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from '../auth/auth.service';
import { UserDTO } from './dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: UserDTO) {
    //this.logger.log(`Creating user: ${JSON.stringify(dto)}`);

    const { email, username, role = 'user' } = dto; 
    const userPassword = dto.password || uuidv4().slice(0, 8);

    //console.log('Creating user with role:', role);

    const userData = {
        email,
        username,
        password: userPassword,
        role,  
    };

    //console.log('Saving user:', userData);

    const user = this.userRepository.create(userData);
    await this.userRepository.save(user);

    //console.log('User created:', user);

    return this.authService.generateTokens({
        member_id: user.id,
        role: user.role,
    });
  }

  async login(dto: { email: string; password: string }) {
    this.logger.log(`Attempting login for: ${dto.email}`);

    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user || user.password !== dto.password) { 
      this.logger.warn(`Invalid credentials for ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    //console.log('User authenticated:', user);

    return this.authService.generateTokens({
      member_id: user.id,
      role: user.role,
    });
  }

  async findUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, dto: UserDTO) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new RpcException('User not found');
    }

    return this.userRepository.save({
      ...user,
      ...dto,
    });
  }

  async deleteUser(id: string) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new RpcException('User not found');
    }
    return this.userRepository.delete(id);
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async resetPassword(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }
    return this.userRepository.save({ ...user, password: '123456' });
  }
}

