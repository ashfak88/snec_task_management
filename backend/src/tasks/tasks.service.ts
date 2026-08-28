import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, reporterId: string) {
    const data: any = {
      ...createTaskDto,
      reporterId,
    };

    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const task = await this.prisma.task.create({
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
        project: { select: { id: true, name: true } },
      },
    });

    if (task.assigneeId && task.assigneeId !== reporterId) {
      await this.notificationsService.create(
        task.assigneeId,
        'Task Assigned',
        `You have been assigned to a new task: ${task.title}`,
      );
    }

    return task;
  }

  async findAll(
    skip?: number,
    take?: number,
    search?: string,
    projectId?: string,
    assigneeId?: string,
    status?: string,
  ) {
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        skip,
        take,
        where,
        include: {
          assignee: { select: { id: true, name: true, profilePicture: true } },
          project: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id, deletedAt: null },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
        project: { select: { id: true, name: true } },
        comments: {
          where: { deletedAt: null },
          include: {
            author: { select: { id: true, name: true, profilePicture: true } },
            mentions: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const existingTask = await this.findOne(id); 

    const data: any = { ...updateTaskDto };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
        reporter: { select: { id: true, name: true } },
      },
    });

    if (
      updateTaskDto.assigneeId &&
      updateTaskDto.assigneeId !== existingTask.assigneeId
    ) {
      await this.notificationsService.create(
        updateTaskDto.assigneeId,
        'Task Reassigned',
        `You have been assigned to task: ${updatedTask.title}`,
      );
    }

    if (updateTaskDto.status && updateTaskDto.status !== existingTask.status) {
      if (updatedTask.reporterId) {
        await this.notificationsService.create(
          updatedTask.reporterId,
          'Task Status Changed',
          `Task "${updatedTask.title}" status changed to ${updateTaskDto.status.replace('_', ' ')}`,
        );
      }
    }

    return updatedTask;
  }

  async bulkUpdateStatus(taskIds: string[], status: string) {
    return this.prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
