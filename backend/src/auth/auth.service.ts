import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Your account has been inactivated. Please contact administration.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions = user.role.permissions.map(
      (rp) => rp.permission.action + ':' + rp.permission.resource,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenString = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenString,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions,
      },
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
      },
      data: {
        isRevoked: true,
      },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;
    if (user.status !== 'ACTIVE' || user.deletedAt) {
      throw new UnauthorizedException(
        'Your account has been inactivated. Please contact administration.',
      );
    }

    const permissions = user.role.permissions.map(
      (rp) => rp.permission.action + ':' + rp.permission.resource,
    );
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    };
    const accessToken = this.jwtService.sign(payload);

    const newRefreshTokenString = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { isRevoked: true },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: newRefreshTokenString,
          expiresAt,
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect old password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      salt,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });
    if (!user) {

      return {
        message: 'If that email exists, a password reset link has been sent.',
      };
    }

    const mockResetToken = randomBytes(32).toString('hex');

    console.log(
      `[MOCK EMAIL] Password reset token for ${user.email}: ${mockResetToken}`,
    );

    return {
      message: 'If that email exists, a password reset link has been sent.',

      mockToken: mockResetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {

    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset request');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      salt,
    );

    await this.prisma.user.update({
      where: { email: resetPasswordDto.email },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return { message: 'Password has been reset successfully' };
  }
}
