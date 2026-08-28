import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin') 
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles and their mapped permissions' })
  getAll() {
    return this.permissionsService.getAllRolesAndPermissions();
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update permissions for a specific role' })
  updateRolePermissions(
    @Param('id') roleId: string,
    @Body('permissionIds') permissionIds: string[],
  ) {
    return this.permissionsService.updateRolePermissions(roleId, permissionIds);
  }
}
