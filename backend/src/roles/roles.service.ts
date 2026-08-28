import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        permissions: {
          create: createRoleDto.permissions.map((permissionId) => ({
            permission: { connect: { id: permissionId } },
          })),
        },
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id); 

    const data: any = {};
    if (updateRoleDto.name) {
      data.name = updateRoleDto.name;
    }

    if (updateRoleDto.permissions) {

      data.permissions = {
        deleteMany: {},
        create: updateRoleDto.permissions.map((permissionId) => ({
          permission: { connect: { id: permissionId } },
        })),
      };
    }

    return this.prisma.role.update({
      where: { id },
      data,
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
