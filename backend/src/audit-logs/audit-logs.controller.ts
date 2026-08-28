import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
  ) {
    return this.auditLogsService.findAll(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : 50,
      search,
      entityType,
      action,
    );
  }
}
