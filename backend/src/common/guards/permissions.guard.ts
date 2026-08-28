import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; 
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User authentication missing');
    }

    if (user.role === 'Super Admin') {
      return true;
    }

    const userPermissions = user.permissions || [];

    const hasPermission = requiredPermissions.every((reqPerm) => {
      const parts = reqPerm.split(':');
      let permString = reqPerm;
      let manageString = reqPerm;

      if (parts.length === 2) {
        const [resource, action] = parts;

        permString = `${action}:${resource}`;

        manageString = `manage:${resource}`;
      }

      return (
        userPermissions.includes(permString) ||
        userPermissions.includes(manageString) ||
        userPermissions.includes(reqPerm)
      );
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Requires: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
