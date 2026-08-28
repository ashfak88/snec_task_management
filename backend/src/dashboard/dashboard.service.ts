import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    const totalProjects = await this.prisma.project.count({
      where: { deletedAt: null },
    });
    const activeProjects = await this.prisma.project.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });

    const completedTasks = await this.prisma.task.count({
      where: { status: 'DONE', deletedAt: null },
    });
    const pendingTasks = await this.prisma.task.count({
      where: { status: { not: 'DONE' }, deletedAt: null },
    });

    const overdueTasks = await this.prisma.task.count({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
        deletedAt: null,
      },
    });

    const tasksGroupByStatus = await this.prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: { deletedAt: null },
    });

    const taskStatusDistribution = tasksGroupByStatus.map((t) => ({
      name: t.status.replace('_', ' '),
      value: t._count.status,
    }));

    return {
      totalProjects,
      activeProjects,
      completedTasks,
      pendingTasks,
      overdueTasks,
      taskStatusDistribution,
    };
  }

  async getRecentActivity(skip: number = 0, take: number = 10) {
    const [activities, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, profilePicture: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { activities, total };
  }
}
