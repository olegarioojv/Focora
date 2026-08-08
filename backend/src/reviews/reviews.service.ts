import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewsBatchDto } from './dto/create-reviews-batch.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createBatch(userId: string, dto: CreateReviewsBatchDto) {
    // Reviews are scheduled client-side, so the server re-checks the same
    // "already scheduled for this task" rule instead of trusting the
    // client not to send duplicates (a direct API call previously could).
    const sourceTaskId = dto.reviews[0]?.sourceTaskId;
    const alreadyExists =
      sourceTaskId &&
      (await this.prisma.review.findFirst({ where: { userId, sourceTaskId } }));

    if (!alreadyExists && dto.reviews.length > 0) {
      await this.prisma.review.createMany({
        data: dto.reviews.map((review) => ({ ...review, userId })),
      });
    }
    return this.findAll(userId);
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new NotFoundException('Revisão não encontrada');
    }
    return this.prisma.review.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new NotFoundException('Revisão não encontrada');
    }
    await this.prisma.review.delete({ where: { id } });
  }
}
