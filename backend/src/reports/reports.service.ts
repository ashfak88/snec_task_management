import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectProgressReport() {
    return this.prisma.project
      .findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          status: true,
          _count: {
            select: {
              tasks: { where: { deletedAt: null } },
            },
          },
          tasks: {
            where: { status: 'DONE', deletedAt: null },
            select: { id: true },
          },
        },
      })
      .then((projects) =>
        projects.map((project) => ({
          id: project.id,
          name: project.name,
          status: project.status,
          totalTasks: project._count.tasks,
          completedTasks: project.tasks.length,
          progressPercentage:
            project._count.tasks > 0
              ? Math.round((project.tasks.length / project._count.tasks) * 100)
              : 0,
        })),
      );
  }

  async getUserProductivityReport() {
    return this.prisma.user
      .findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          assignedTasks: {
            where: { deletedAt: null },
            select: {
              id: true,
              status: true,
              estimatedHours: true,
              actualHours: true,
            },
          },
        },
      })
      .then((users) =>
        users.map((user) => {
          const totalAssigned = user.assignedTasks.length;
          const completed = user.assignedTasks.filter(
            (t) => t.status === 'DONE',
          ).length;
          const totalEstimatedHours = user.assignedTasks.reduce(
            (sum, t) => sum + (t.estimatedHours || 0),
            0,
          );
          const totalActualHours = user.assignedTasks.reduce(
            (sum, t) => sum + (t.actualHours || 0),
            0,
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            totalAssigned,
            completed,
            totalEstimatedHours,
            totalActualHours,
          };
        }),
      );
  }

  async getOverdueTasksReport() {
    return this.prisma.task.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
