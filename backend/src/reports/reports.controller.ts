import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin', 'Admin', 'Project Manager')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('project-progress')
  @ApiOperation({ summary: 'Get project progress report' })
  getProjectProgressReport() {
    return this.reportsService.getProjectProgressReport();
  }

  @Get('user-productivity')
  @ApiOperation({ summary: 'Get user productivity report' })
  getUserProductivityReport() {
    return this.reportsService.getUserProductivityReport();
  }

  @Get('overdue-tasks')
  @ApiOperation({ summary: 'Get overdue tasks report' })
  getOverdueTasksReport() {
    return this.reportsService.getOverdueTasksReport();
  }
}
