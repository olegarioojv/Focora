import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { createHash } from 'crypto';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { redactPayload } from '../utils/redact';

type AuthedRequest = Request & { user?: { id: string } };

@Catch()
export class ErrorLogFilter extends BaseExceptionFilter {
  constructor(
    private readonly prisma: PrismaService,
    httpAdapterHost: HttpAdapterHost,
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Only 500s go to the grouped error monitor — 4xx (bad input, auth
    // failures) are normal traffic already visible in the request logs.
    if (status >= 500) {
      this.logError(exception, host);
    }

    super.catch(exception, host);
  }

  private logError(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<AuthedRequest>();
    const message = exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;
    const firstFrame = stack?.split('\n')[1]?.trim() ?? '';
    const fingerprint = createHash('sha1')
      .update(`${message}:${firstFrame}`)
      .digest('hex');

    // Redacted so passwords/tokens in the request body never land in the
    // database in plain text — the point is to see the *shape* of the
    // request that caused the error, not to capture credentials.
    const payload =
      request?.body && Object.keys(request.body).length > 0
        ? (redactPayload(request.body) as object)
        : undefined;

    this.prisma.errorLog
      .upsert({
        where: { fingerprint },
        create: {
          fingerprint,
          message,
          stack,
          endpoint: request?.path,
          method: request?.method,
          userId: request?.user?.id,
          environment: process.env.NODE_ENV ?? 'development',
          payload,
        },
        update: {
          occurrenceCount: { increment: 1 },
          lastSeenAt: new Date(),
          payload,
        },
      })
      .catch(() => {
        // Best-effort — never let error logging itself throw.
      });
  }
}
