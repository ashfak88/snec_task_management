import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@example.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        passwordHash: 'hashed',
        status: 'ACTIVE',
        role: { name: 'Admin', permissions: [] },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if login successful', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test',
        status: 'ACTIVE',
        role: { name: 'Admin', permissions: [] },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        token: 'mock-refresh-token',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'pass123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });
  });
});
