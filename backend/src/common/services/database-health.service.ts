import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DatabaseHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'online' as const, latencyMs: Date.now() - start };
    } catch {
      return { status: 'offline' as const, latencyMs: null };
    }
  }
}
