import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    skip?: number,
    take?: number,
    search?: string,
    entityType?: string,
    action?: string,
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}
