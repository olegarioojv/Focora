import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { createRequestLogMiddleware } from './common/middleware/request-log.middleware';
import { csrfMiddleware } from './common/middleware/csrf.middleware';
import { CSRF_HEADER } from './auth/cookie.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    // Lets frontend JS read the CSRF token echoed back on every response
    // (see csrf.middleware.ts) even when frontend and API are on different
    // domains — browsers hide response headers from cross-origin JS by
    // default unless explicitly exposed here.
    exposedHeaders: [CSRF_HEADER],
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(createRequestLogMiddleware(app.get(PrismaService)));
  app.use(csrfMiddleware);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
