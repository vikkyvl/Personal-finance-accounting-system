import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async requestPasswordReset(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new RpcException('User not found');
    }

    const token = uuidv4(); // генерація токену
    user.resetToken = token;
    user.resetTokenExpiry = addHours(new Date(), 1); // 1 година

    await this.userRepository.save(user);

    // НАДСИЛАННЯ EMAIL (можемо зробити нижче)
    const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    // тут інтегруй Nodemailer, SendGrid або інше
    // console.log(`Password reset link for ${email}: ${resetLink}`);
    await this.sendResetEmail(email, resetLink);

    return { message: 'Reset email sent' };
  }

  async resetPasswordConfirm(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new RpcException('Invalid or expired token');
    }

    user.password = newPassword; // Рекомендується: bcrypt.hash(newPassword, 10)
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successful' };
  }

  async sendResetEmail(to: string, link: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ukr.net',
      port: 465,
      secure: true,
      auth: {
        user: 'staff-base@ukr.net',
        pass: '9no5mk9ONXolZjDb', // app password
      },
      tls: {
        rejectUnauthorized: false, // ← додай це
      },
    });


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

      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

}

