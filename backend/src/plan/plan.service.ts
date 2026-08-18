import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

const DEFAULT_AVAILABILITY = {
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 2,
  friday: 2,
  saturday: 1,
  sunday: 1,
};

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(userId: string) {
    const existing = await this.prisma.plan.findUnique({ where: { userId } });
    if (existing) return existing;

    return this.prisma.plan.create({
      data: { userId, objective: '', availability: DEFAULT_AVAILABILITY },
    });
  }

  async update(userId: string, dto: UpdatePlanDto) {
    await this.findOrCreate(userId);
    return this.prisma.plan.update({
      where: { userId },
      data: {
        ...dto,
        schedule:
          dto.schedule === null
            ? Prisma.JsonNull
            : (dto.schedule as Prisma.InputJsonValue | undefined),
        studyConfig: dto.studyConfig as Prisma.InputJsonValue | undefined,
        reviewConfig: dto.reviewConfig as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
