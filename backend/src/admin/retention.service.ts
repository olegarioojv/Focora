import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

const REQUEST_LOG_RETENTION_DAYS = 60;
const HEALTH_SNAPSHOT_RETENTION_DAYS = 30;
// ErrorLog rows are upserted (occurrenceCount/lastSeenAt), not appended, so
// this only prunes errors that haven't recurred in a long time.
const ERROR_LOG_RETENTION_DAYS = 90;

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

@Injectable()
export class RetentionService implements OnModuleInit {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.cleanup().catch((error) => {
      this.logger.error('Retention cleanup failed', error);
    });
    setInterval(() => {
      this.cleanup().catch((error) => {
        this.logger.error('Retention cleanup failed', error);
      });
    }, CLEANUP_INTERVAL_MS);
  }

  private async cleanup() {
    const [requestLogs, healthSnapshots, errorLogs] = await Promise.all([
      this.prisma.requestLog.deleteMany({
        where: { createdAt: { lt: daysAgo(REQUEST_LOG_RETENTION_DAYS) } },
      }),
      this.prisma.healthSnapshot.deleteMany({
        where: { createdAt: { lt: daysAgo(HEALTH_SNAPSHOT_RETENTION_DAYS) } },
      }),
      this.prisma.errorLog.deleteMany({
        where: { lastSeenAt: { lt: daysAgo(ERROR_LOG_RETENTION_DAYS) } },
      }),
    ]);

    const guestCount = await this.cleanupExpiredGuests();

    if (requestLogs.count || healthSnapshots.count || errorLogs.count || guestCount) {
      this.logger.log(
        `Retention cleanup: ${requestLogs.count} request logs, ${healthSnapshots.count} health snapshots, ${errorLogs.count} error logs, ${guestCount} expired guest accounts removed.`,
      );
    }
  }

  // Guest accounts (1-day trial) were never cleaned up — nothing ever
  // deleted an abandoned guest row once its trial expired, so the users
  // table grew unbounded. Cascade relations (Settings/Plan/DailyLog/
  // Subject/Review) handle themselves; a group the guest owned does not
  // cascade (ON DELETE RESTRICT, deliberately — see admin deleteUser),
  // so it's removed explicitly first.
  private async cleanupExpiredGuests() {
    const expired = await this.prisma.user.findMany({
      where: { isGuest: true, guestExpiresAt: { lt: new Date() } },
      select: { id: true },
    });
    if (expired.length === 0) return 0;

    const ids = expired.map((user) => user.id);
    await this.prisma.$transaction([
      this.prisma.group.deleteMany({ where: { ownerId: { in: ids } } }),
      this.prisma.user.deleteMany({ where: { id: { in: ids } } }),
    ]);
    return ids.length;
  }
}
