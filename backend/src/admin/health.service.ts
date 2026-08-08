import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessMetricsService } from '../common/services/process-metrics.service';
import { DatabaseHealthService } from '../common/services/database-health.service';
import { EmailNotifierService } from './email-notifier.service';
import { ALERT_TYPE_LABELS } from './alert-labels';

const SNAPSHOT_INTERVAL_MS = 30_000;

// Fixed thresholds — no settings UI for these yet, deliberately simple.
const HIGH_CPU_PERCENT = 80;
// RSS in MB, not heapUsed/heapTotal ratio — that ratio sits at 80-90%+
// under totally normal V8 GC behavior (heapTotal is "currently
// allocated", not "available ceiling"), so it was flapping constantly
// as a false positive. RSS against a fixed ceiling is a real signal.
const HIGH_MEMORY_RSS_MB = 500;
const MANY_ERRORS_THRESHOLD = 5;
const MANY_LOGIN_FAILURES_THRESHOLD = 10;
const REQUEST_SPIKE_THRESHOLD = 200;

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processMetrics: ProcessMetricsService,
    private readonly databaseHealth: DatabaseHealthService,
    private readonly email: EmailNotifierService,
  ) {}

  onModuleInit() {
    setInterval(() => {
      this.tick().catch((error) => {
        this.logger.error('Health tick failed', error);
      });
    }, SNAPSHOT_INTERVAL_MS);
  }

  private async tick() {
    const db = await this.databaseHealth.check();
    const cpuPercent = this.processMetrics.getCpuPercent();
    const memory = this.processMetrics.getMemoryUsage();

    await this.prisma.healthSnapshot.create({
      data: {
        dbStatus: db.status,
        dbLatencyMs: db.latencyMs,
        cpuPercent,
        memoryRssMb: memory.rssMb,
      },
    });

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oneMinAgo = new Date(Date.now() - 60 * 1000);

    const [errorCount, loginFailureCount, requestCount] = await Promise.all([
      this.prisma.requestLog.count({
        where: { createdAt: { gte: fiveMinAgo }, statusCode: { gte: 500 } },
      }),
      this.prisma.requestLog.count({
        where: {
          createdAt: { gte: fiveMinAgo },
          eventType: 'auth.login',
          statusCode: 401,
        },
      }),
      this.prisma.requestLog.count({ where: { createdAt: { gte: oneMinAgo } } }),
    ]);

    await Promise.all([
      this.upsertAlert(
        'db_down',
        db.status === 'offline',
        'critical',
        'Banco de dados indisponível.',
      ),
      this.upsertAlert(
        'high_cpu',
        cpuPercent > HIGH_CPU_PERCENT,
        'warning',
        `Uso de CPU elevado (${cpuPercent}%).`,
      ),
      this.upsertAlert(
        'high_memory',
        memory.rssMb > HIGH_MEMORY_RSS_MB,
        'warning',
        `Uso de memória elevado (${memory.rssMb}MB).`,
      ),
      this.upsertAlert(
        'many_errors',
        errorCount > MANY_ERRORS_THRESHOLD,
        'critical',
        `${errorCount} erros 5xx nos últimos 5 minutos.`,
      ),
      this.upsertAlert(
        'many_login_failures',
        loginFailureCount > MANY_LOGIN_FAILURES_THRESHOLD,
        'warning',
        `${loginFailureCount} falhas de login nos últimos 5 minutos.`,
      ),
      this.upsertAlert(
        'request_spike',
        requestCount > REQUEST_SPIKE_THRESHOLD,
        'warning',
        `Pico de requisições: ${requestCount} no último minuto.`,
      ),
    ]);
  }

  // Keeps exactly one open (unresolved) alert per type: creates it when the
  // condition first becomes true, resolves it when the condition clears.
  // Doesn't insert a new row on every tick while the condition persists.
  private async upsertAlert(
    type: string,
    isActive: boolean,
    severity: string,
    message: string,
  ) {
    const existing = await this.prisma.alert.findFirst({
      where: { type, resolvedAt: null },
    });

    if (isActive && !existing) {
      await this.prisma.alert.create({ data: { type, severity, message } });
      await this.email.sendAlert({
        status: 'triggered',
        typeLabel: ALERT_TYPE_LABELS[type] ?? type,
        severity,
        message,
        timestamp: new Date(),
      });
    } else if (!isActive && existing) {
      await this.prisma.alert.update({
        where: { id: existing.id },
        data: { resolvedAt: new Date() },
      });
      await this.email.sendAlert({
        status: 'resolved',
        typeLabel: ALERT_TYPE_LABELS[type] ?? type,
        severity,
        message,
        timestamp: new Date(),
      });
    }
  }
}
