import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { dateStringInTimezone, todayDateString } from '../common/utils/date';

const XP_PER_POMODORO = 10;
const XP_PER_TASK = 15;
const XP_PER_REVIEW = 20;

// A minimum gap between two pomodoro awards, closing the "curl this
// endpoint in a loop" XP-farming hole — see awardPomodoro below.
const MIN_SECONDS_BETWEEN_POMODOROS = 30;

function yesterdayDateString() {
  // Brazil has not observed DST since 2019, so a flat 24h subtraction is
  // safe here.
  return dateStringInTimezone(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(userId: string) {
    const existing = await this.prisma.settings.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.prisma.settings.create({ data: { userId } });
  }

  async update(userId: string, dto: UpdateSettingsDto) {
    await this.findOrCreate(userId);
    return this.prisma.settings.update({ where: { userId }, data: dto });
  }

  listDailyLogs(userId: string) {
    return this.prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  // Guest accounts are excluded: they're ephemeral (1-day trial) and would
  // just add noise to a leaderboard meant for real, ongoing progress.
  async getRanking() {
    const entries = await this.prisma.settings.findMany({
      where: { user: { isGuest: false } },
      orderBy: { xp: 'desc' },
      take: 20,
      select: {
        xp: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return entries.map((entry) => ({
      id: entry.user.id,
      name: entry.user.name,
      avatarUrl: entry.user.avatarUrl,
      xp: entry.xp,
    }));
  }

  // Any real activity (pomodoro/task/review) counts toward the streak.
  // Same day again: no change. Yesterday: streak continues. Anything
  // else (including a first-ever activity): streak restarts at 1.
  // longestStreak is the all-time record, used by the admin panel.
  private streakUpdate(settings: {
    lastActiveDate: string | null;
    currentStreak: number;
    longestStreak: number;
  }) {
    const today = todayDateString();
    if (settings.lastActiveDate === today) {
      return {
        currentStreak: settings.currentStreak,
        lastActiveDate: today,
        longestStreak: Math.max(settings.longestStreak, settings.currentStreak),
      };
    }
    const currentStreak =
      settings.lastActiveDate === yesterdayDateString()
        ? settings.currentStreak + 1
        : 1;
    return {
      currentStreak,
      lastActiveDate: today,
      longestStreak: Math.max(settings.longestStreak, currentStreak),
    };
  }

  // Runs `fn` in a Serializable transaction, retrying once on a
  // concurrent-write conflict (Postgres aborts one of two racing
  // transactions touching the same row under this isolation level).
  // Used by every award method below so read-then-write XP/streak/
  // awarded-id updates can't race each other.
  private async runSerializable<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await this.prisma.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        const isSerializationFailure =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';
        if (!isSerializationFailure || attempt === 1) throw error;
      }
    }
    throw new ConflictException('Não foi possível concluir, tente novamente');
  }

  async awardPomodoro(userId: string, durationMinutes: number) {
    return this.runSerializable(async (tx) => {
      const settings = await tx.settings.findUnique({ where: { userId } });
      const current = settings ?? (await tx.settings.create({ data: { userId } }));

      // A real pomodoro takes at least `durationMinutes` to complete —
      // rejecting awards that arrive faster than the previous one could
      // possibly have finished closes the "call this endpoint in a loop"
      // farming hole without needing a full server-tracked timer session.
      if (current.lastPomodoroAwardAt) {
        const secondsSinceLast =
          (Date.now() - current.lastPomodoroAwardAt.getTime()) / 1000;
        if (secondsSinceLast < MIN_SECONDS_BETWEEN_POMODOROS) {
          throw new ConflictException(
            'Aguarde a conclusão do ciclo anterior antes de registrar outro',
          );
        }
      }

      const today = todayDateString();
      await tx.dailyLog.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, minutes: durationMinutes, pomodoros: 1 },
        update: {
          minutes: { increment: durationMinutes },
          pomodoros: { increment: 1 },
        },
      });

      return tx.settings.update({
        where: { userId },
        data: {
          xp: current.xp + XP_PER_POMODORO,
          totalPomodoros: current.totalPomodoros + 1,
          totalFocusMinutes: current.totalFocusMinutes + durationMinutes,
          lastPomodoroAwardAt: new Date(),
          ...this.streakUpdate(current),
        },
      });
    });
  }

  // Award-once-per-id: prevents farming XP by toggling a task/review
  // completion checkbox on and off repeatedly (or across devices).
  async awardTask(userId: string, taskId: string) {
    return this.runSerializable(async (tx) => {
      const settings = await tx.settings.findUnique({ where: { userId } });
      const current = settings ?? (await tx.settings.create({ data: { userId } }));
      if (current.awardedTaskIds.includes(taskId)) return current;

      return tx.settings.update({
        where: { userId },
        data: {
          xp: current.xp + XP_PER_TASK,
          totalTasksCompleted: current.totalTasksCompleted + 1,
          awardedTaskIds: [...current.awardedTaskIds, taskId],
          ...this.streakUpdate(current),
        },
      });
    });
  }

  async awardReview(userId: string, reviewId: string) {
    return this.runSerializable(async (tx) => {
      const settings = await tx.settings.findUnique({ where: { userId } });
      const current = settings ?? (await tx.settings.create({ data: { userId } }));
      if (current.awardedReviewIds.includes(reviewId)) return current;

      return tx.settings.update({
        where: { userId },
        data: {
          xp: current.xp + XP_PER_REVIEW,
          totalReviewsCompleted: current.totalReviewsCompleted + 1,
          awardedReviewIds: [...current.awardedReviewIds, reviewId],
          ...this.streakUpdate(current),
        },
      });
    });
  }
}
