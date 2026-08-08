import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { HealthService } from './health.service';
import { RetentionService } from './retention.service';
import { RolesGuard } from './guards/roles.guard';
import { ProcessMetricsService } from '../common/services/process-metrics.service';
import { DatabaseHealthService } from '../common/services/database-health.service';
import { EmailNotifierService } from './email-notifier.service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    HealthService,
    RetentionService,
    RolesGuard,
    ProcessMetricsService,
    DatabaseHealthService,
    EmailNotifierService,
  ],
})
export class AdminModule {}
