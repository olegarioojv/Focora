import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SubjectsModule } from './subjects/subjects.module';
import { PlanModule } from './plan/plan.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DayPlanModule } from './day-plan/day-plan.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { GroupsModule } from './groups/groups.module';
import { NotesModule } from './notes/notes.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { ErrorLogFilter } from './common/filters/error-log.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Default rate limit for the whole API — generous enough for normal
    // use, but closes the "unlimited requests" gap. Auth endpoints layer a
    // much stricter limit on top via @Throttle (see auth.controller.ts).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    SubjectsModule,
    PlanModule,
    ReviewsModule,
    DayPlanModule,
    SettingsModule,
    AdminModule,
    GroupsModule,
    NotesModule,
    FlashcardsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ErrorLogFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
