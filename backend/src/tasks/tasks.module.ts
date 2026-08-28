import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [PrismaModule, NotificationsModule, CommentsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
