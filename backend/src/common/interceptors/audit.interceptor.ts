import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip } = request;

    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap((response) => {
        if (isMutation) {

          const pathSegments = url.split('/').filter(Boolean);
          const entityType = pathSegments[1] || pathSegments[0] || 'Unknown';

          let entityId = pathSegments[2] || 'N/A'; 

          let action = 'CREATE';
          if (method === 'PATCH' || method === 'PUT') action = 'UPDATE';
          if (method === 'DELETE') action = 'DELETE';

          if (
            entityType === 'auth' &&
            (pathSegments[2] === 'login' || pathSegments[2] === 'logout')
          ) {
            action = pathSegments[2].toUpperCase();
          }

          if (action === 'CREATE' && response?.id) {
            entityId = response.id;
          }

          const resolvedUser = user || response?.user || null;

          const isUUID = (str: string) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              str,
            );

          let finalEntityId =
            entityType === 'auth' ? resolvedUser?.id || '' : entityId;
          if (!isUUID(finalEntityId)) {
            finalEntityId = '00000000-0000-0000-0000-000000000000'; 
          }

          let finalUserId = resolvedUser?.id || null;
          if (finalUserId && !isUUID(finalUserId)) {
            finalUserId = null;
          }

          this.prisma.auditLog
            .create({
              data: {
                userId: finalUserId,
                action,
                entityType,
                entityId: finalEntityId,
                changes: JSON.stringify(body || {}),
                ipAddress:
                  ip ||
                  request.headers['x-forwarded-for'] ||
                  request.connection?.remoteAddress ||
                  'Unknown',
              },
            })
            .catch((err) => {
              console.error('Failed to write audit log:', err);
            });
        }
      }),
    );
  }
}
