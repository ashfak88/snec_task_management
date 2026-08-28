import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getAllRolesAndPermissions() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const allPermissions = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    return { roles, permissions: allPermissions };
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    await this.prisma.$transaction(async (prisma) => {

      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      if (permissionIds && permissionIds.length > 0) {
        const mappings = permissionIds.map((pid) => ({
          roleId: roleId,
          permissionId: pid,
        }));
        await prisma.rolePermission.createMany({
          data: mappings,
        });
      }
    });

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }
}
