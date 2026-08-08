import type { NextFunction, Request, Response } from 'express';
import type { PrismaService } from '../../prisma/prisma.service';
import { parseUserAgent } from '../utils/user-agent';
import { deriveEventType } from '../utils/event-type';

type AuthedRequest = Request & { user?: { id: string } };

// Registered via app.use() in main.ts (not a NestInterceptor) specifically
// so it can listen to the response's 'finish' event — that's the only
// point where statusCode is guaranteed final for BOTH success and error
// responses, sidestepping interceptor-vs-exception-filter ordering.
export function createRequestLogMiddleware(prisma: PrismaService) {
  return (request: AuthedRequest, response: Response, next: NextFunction) => {
    const start = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - start;
      const { browser, os } = parseUserAgent(
        request.headers['user-agent'] as string | undefined,
      );
      const adminActionMatch = /^\/admin\/users\/([^/]+)/.exec(request.path);
      const targetUserId =
        adminActionMatch && adminActionMatch[1] !== request.user?.id
          ? adminActionMatch[1]
          : undefined;

      prisma.requestLog
        .create({
          data: {
            method: request.method,
            endpoint: request.path,
            statusCode: response.statusCode,
            durationMs,
            userId: request.user?.id,
            targetUserId,
            eventType: deriveEventType(request.method, request.path),
            ip: request.ip,
            userAgent: request.headers['user-agent'] as string | undefined,
            browser,
            os,
          },
        })
        .catch(() => {
          // Best-effort — a logging failure must never affect the app.
        });

      // "Último acesso"/IP shown in the admin panel is tracked from real
      // activity, not just explicit /auth/login calls — otherwise a user
      // whose session was restored from localStorage (the normal case)
      // would show a stale or empty IP forever.
      if (request.user?.id) {
        prisma.user
          .update({
            where: { id: request.user.id },
            data: {
              lastLoginAt: new Date(),
              lastLoginIp: request.ip,
              lastLoginUserAgent: request.headers['user-agent'] as
                | string
                | undefined,
            },
          })
          .catch(() => {
            // Best-effort.
          });
      }
    });

    next();
  };
}
