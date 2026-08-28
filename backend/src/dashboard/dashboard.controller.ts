import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  getDashboardMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get paginated recent activity' })
  getRecentActivity(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.dashboardService.getRecentActivity(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 10,
    );
  }
}
