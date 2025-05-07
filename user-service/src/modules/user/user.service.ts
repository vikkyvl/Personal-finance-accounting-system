import {ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import * as nodemailer from 'nodemailer';

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
  ) {
  }

  async createUser(dto: UserDTO) {
    const { email, username, role = 'user' } = dto;
    const userPassword = dto.password || uuidv4().slice(0, 8);

    const userData = {
      email,
      username,
      password: userPassword,
      role,
    };

    try {
      const user = this.userRepository.create(userData);
      await this.userRepository.save(user);
      await this.sendWelcomeEmail(email);

      return this.authService.generateTokens({
        member_id: user.id,
        role: user.role,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new RpcException('User already exists');
      }
      throw new RpcException('Unexpected error');
    }
  }


async login(dto: { email: string; password: string }) {
    this.logger.log(`Attempting login for: ${dto.email}`);

    const user = await this.userRepository.findOne({where: {email: dto.email}});

    if (!user) {
      this.logger.warn(`User not found: ${dto.email}`);
      throw new RpcException('User not found');
    }

    if (user.password !== dto.password) {
      this.logger.warn(`Invalid password for: ${dto.email}`);
      throw new RpcException('Invalid password');
    }

    if (user.password !== dto.password) {
      this.logger.warn(`Invalid password for: ${dto.email}`);
      throw new UnauthorizedException('Incorrect password');
    }

    const tokens = await this.authService.generateTokens({
      member_id: user.id,
      role: user.role,
    });

    return {
      ...tokens,
      userId: user.id,
    };
  }


  async findUserById(id: string) {
    return this.userRepository.findOne({where: {id}});
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
    return this.userRepository.findOne({where: {email}});
  }

  async resetPassword(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }
    return this.userRepository.save({...user, password: '123456'});
  }

  async requestPasswordReset(email: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new RpcException('User not found');
    }

    const token = uuidv4();
    user.resetToken = token;
    user.resetTokenExpiry = addHours(new Date(), 1); // 1 година

    await this.userRepository.save(user);

    const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    await this.sendResetEmail(email, resetLink);

    return { message: 'Reset email sent' };
  }

  async resetPasswordConfirm(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({where: {resetToken: token}});

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new RpcException('Invalid or expired token');
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userRepository.save(user);

    return {message: 'Password reset successful'};
  }

  private createTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.ukr.net',
      port: 465,
      secure: true,
      auth: {
        user: 'staff-base@ukr.net',
        pass: '9no5mk9ONXolZjDb',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendResetEmail(to: string, link: string) {
    const transporter = this.createTransporter();

    try {
      const info = await transporter.sendMail({
        from: '"Finance App Support" <staff-base@ukr.net>',
        to,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Password Reset</h2>
            <p>You requested to reset your password.</p>
            <p>Click the link below to proceed:</p>
            <p>
              <a href="${link}" style="color: #00c49f;">Reset Password</a>
            </p>
            <br/>
            <p>If you didn’t request this, please ignore this email.</p>
          </div>
        `,
      });

      console.log('Reset email sent:', info.messageId);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(to: string) {
    const transporter = this.createTransporter();

    try {
      const info = await transporter.sendMail({
        from: '"Finance App" <staff-base@ukr.net>',
        to,
        subject: 'Welcome to Finance App!',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome!</h2>
            <p>Thank you for registering in our Finance App.</p>
            <p>We’re glad to have you on board!</p>
          </div>
        `,
      });

      console.log('Welcome email sent:', info.messageId);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}
