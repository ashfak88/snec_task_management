import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: string = 'SYSTEM',
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
