import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

const GUEST_TRIAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  findByGithubId(githubId: string) {
    return this.prisma.user.findUnique({ where: { githubId } });
  }

  create(data: { name: string; email: string; password: string }) {
    return this.prisma.user.create({ data });
  }

  createGuest() {
    return this.prisma.user.create({
      data: {
        name: 'Convidado',
        isGuest: true,
        guestExpiresAt: new Date(Date.now() + GUEST_TRIAL_MS),
      },
    });
  }

  async update(id: string, dto: UpdateMeDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  toPublic(user: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string | null;
    isGuest: boolean;
    guestExpiresAt: Date | null;
    role: string;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isGuest: user.isGuest,
      guestExpiresAt: user.guestExpiresAt,
      role: user.role,
    };
  }
}
