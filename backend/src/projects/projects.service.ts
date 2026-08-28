import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProjectDto: CreateProjectDto) {
    const { memberIds, ...projectData } = createProjectDto;

    return this.prisma.project.create({
      data: {
        ...projectData,
        startDate: projectData.startDate
          ? new Date(projectData.startDate)
          : undefined,
        endDate: projectData.endDate
          ? new Date(projectData.endDate)
          : undefined,
        members: {
          create:
            memberIds?.map((userId) => ({
              user: { connect: { id: userId } },
            })) || [],
        },
      },
      include: { members: { include: { user: true } } },
    });
  }

  async findAll(
    skip?: number,
    take?: number,
    search?: string,
    status?: string,
    priority?: string,
  ) {
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [rawProjects, total] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take,
        where,
        include: {
          _count: { select: { tasks: { where: { deletedAt: null } } } },
          members: { select: { userId: true } },
          tasks: { select: { assigneeId: true }, where: { deletedAt: null } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    const projects = rawProjects.map((p) => {
      const uniqueMembers = new Set([
        ...p.members.map((m) => m.userId),
        ...p.tasks.filter((t) => t.assigneeId).map((t) => t.assigneeId),
      ]);

      const { tasks, members, ...projectData } = p;
      return {
        ...projectData,
        _count: {
          ...p._count,
          members: uniqueMembers.size,
        },
      };
    });

    return { projects, total };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        tasks: { where: { deletedAt: null } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id); 

    const { memberIds, ...projectData } = updateProjectDto;

    const data: any = {
      ...projectData,
    };

    if (projectData.startDate) data.startDate = new Date(projectData.startDate);
    if (projectData.endDate) data.endDate = new Date(projectData.endDate);

    if (memberIds) {
      data.members = {
        deleteMany: {},
        create: memberIds.map((userId) => ({
          user: { connect: { id: userId } },
        })),
      };
    }

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
