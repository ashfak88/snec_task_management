import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, salt);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        status: true,
        profilePicture: true,
        roleId: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    skip?: number,
    take?: number,
    search?: string,
    roleId?: string,
    status?: string,
  ) {
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); 

    const data: any = { ...updateUserDto };

    if (updateUserDto.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(updateUserDto.passwordHash, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        status: true,
        roleId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
