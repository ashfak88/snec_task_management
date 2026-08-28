import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, authorId: string) {
    const { mentionIds = [], content, ...commentData } = createCommentDto;

    const mentionRegex = /@([a-zA-Z0-9_\s]+)(?=\b|$)/g;
    const matches = [...content.matchAll(mentionRegex)];
    let parsedMentionIds: string[] = [];

    if (matches.length > 0) {
      const names = matches.map((match) => match[1].trim());
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          name: { in: names },
          deletedAt: null,
        },
        select: { id: true },
      });
      parsedMentionIds = mentionedUsers.map((u) => u.id);
    }

    const allMentionIds = Array.from(
      new Set([...mentionIds, ...parsedMentionIds]),
    );

    const comment = await this.prisma.comment.create({
      data: {
        ...commentData,
        content,
        authorId,
        mentions: {
          create: allMentionIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (allMentionIds.length > 0) {
      for (const mentionedUserId of allMentionIds) {
        if (mentionedUserId !== authorId) {
          await this.notificationsService.create(
            mentionedUserId,
            'You were mentioned',
            `${comment.author.name} mentioned you in a comment`,
          );
        }
      }
    }

    return comment;
  }

  async findAllByTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const { mentionIds, content, ...commentData } = updateCommentDto;

    const data: any = { ...commentData, content };

    if (content) {

      const mentionRegex = /@([a-zA-Z0-9_\s]+)(?=\b|$)/g;
      const matches = [...content.matchAll(mentionRegex)];
      let parsedMentionIds: string[] = [];

      if (matches.length > 0) {
        const names = matches.map((match) => match[1].trim());
        const mentionedUsers = await this.prisma.user.findMany({
          where: { name: { in: names }, deletedAt: null },
          select: { id: true },
        });
        parsedMentionIds = mentionedUsers.map((u) => u.id);
      }

      const allMentionIds = Array.from(
        new Set([...(mentionIds || []), ...parsedMentionIds]),
      );

      data.mentions = {
        deleteMany: {},
        create: allMentionIds.map((uId) => ({
          user: { connect: { id: uId } },
        })),
      };
    } else if (mentionIds) {
      data.mentions = {
        deleteMany: {},
        create: mentionIds.map((uId) => ({
          user: { connect: { id: uId } },
        })),
      };
    }

    return this.prisma.comment.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, profilePicture: true } },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
