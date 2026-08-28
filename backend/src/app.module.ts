import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, 
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    AttachmentsModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    AuditLogsModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
