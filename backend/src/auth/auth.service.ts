import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

interface SessionUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  isGuest: boolean;
  guestExpiresAt: Date | null;
  role: string;
}

interface GuestTokenPayload {
  sub: string;
  isGuest: boolean;
}

interface SessionMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async guestSession(meta?: SessionMeta) {
    const guest = await this.usersService.createGuest();
    return this.buildSession(guest, meta);
  }

  async register(dto: RegisterDto, guestToken?: string, meta?: SessionMeta) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const guest = await this.resolveGuest(guestToken);

    if (guest) {
      const converted = await this.prisma.user.update({
        where: { id: guest.id },
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          isGuest: false,
          guestExpiresAt: null,
        },
      });
      return this.buildSession(converted, meta);
    }

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return this.buildSession(user, meta);
  }

  async login(dto: LoginDto, guestToken?: string, meta?: SessionMeta) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const guest = await this.resolveGuest(guestToken);
    if (guest && guest.id !== user.id) {
      await this.mergeGuestInto(guest.id, user.id);
    }

    return this.buildSession(user, meta);
  }

  // Resolves an OAuth login: links to an existing account by provider id
  // (or by matching e-mail if the account was created locally), or creates
  // a new one. If a guest session is present, either converts the guest
  // row in place (brand-new OAuth identity) or merges into the account
  // the OAuth identity already resolves to.
  async loginWithOAuth(
    provider: 'google' | 'github',
    profile: { providerId: string; email: string | null; name: string; avatarUrl: string | null },
    guestToken?: string,
    meta?: SessionMeta,
  ) {
    const idField = provider === 'google' ? 'googleId' : 'githubId';
    const existing =
      provider === 'google'
        ? await this.usersService.findByGoogleId(profile.providerId)
        : await this.usersService.findByGithubId(profile.providerId);

    if (existing) {
      const guest = await this.resolveGuest(guestToken);
      if (guest && guest.id !== existing.id) {
        await this.mergeGuestInto(guest.id, existing.id);
      }
      return this.buildSession(existing, meta);
    }

    const byEmail = profile.email
      ? await this.usersService.findByEmail(profile.email)
      : null;
    if (byEmail) {
      // Never auto-link an OAuth identity to an account that already has a
      // password: anyone who knows a victim's e-mail could register that
      // e-mail with their own password ahead of time, then silently take
      // over the account the moment the victim signs in with Google/GitHub.
      // A password-less account (previously OAuth-only, or a bare
      // guest-converted row) has no such secret to steal, so linking there
      // is safe.
      if (byEmail.password) {
        throw new ConflictException(
          'Já existe uma conta com este e-mail. Entre com sua senha para acessá-la.',
        );
      }
      const linked = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: { [idField]: profile.providerId },
      });
      const guest = await this.resolveGuest(guestToken);
      if (guest && guest.id !== linked.id) {
        await this.mergeGuestInto(guest.id, linked.id);
      }
      return this.buildSession(linked, meta);
    }

    const guest = await this.resolveGuest(guestToken);
    if (guest) {
      const converted = await this.prisma.user.update({
        where: { id: guest.id },
        data: {
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          isGuest: false,
          guestExpiresAt: null,
          [idField]: profile.providerId,
        },
      });
      return this.buildSession(converted, meta);
    }

    const created = await this.prisma.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        [idField]: profile.providerId,
      },
    });
    return this.buildSession(created, meta);
  }

  private async resolveGuest(token?: string) {
    if (!token) return null;
    try {
      const payload = this.jwtService.verify<GuestTokenPayload>(token);
      if (!payload.isGuest) return null;
      return this.usersService.findById(payload.sub);
    } catch {
      return null;
    }
  }

  // Folds a guest account's data into an existing target account, then
  // discards the guest row. Subject/Review reparent cleanly (no unique
  // constraint on userId); DailyLog rows merge by date; Settings numeric
  // fields are summed; Plan is only kept if the target has none yet.
  private async mergeGuestInto(guestUserId: string, targetUserId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.subject.updateMany({
        where: { userId: guestUserId },
        data: { userId: targetUserId },
      });
      await tx.review.updateMany({
        where: { userId: guestUserId },
        data: { userId: targetUserId },
      });

      const guestLogs = await tx.dailyLog.findMany({
        where: { userId: guestUserId },
      });
      for (const log of guestLogs) {
        await tx.dailyLog.upsert({
          where: { userId_date: { userId: targetUserId, date: log.date } },
          create: {
            userId: targetUserId,
            date: log.date,
            minutes: log.minutes,
            pomodoros: log.pomodoros,
          },
          update: {
            minutes: { increment: log.minutes },
            pomodoros: { increment: log.pomodoros },
          },
        });
      }
      await tx.dailyLog.deleteMany({ where: { userId: guestUserId } });

      const guestSettings = await tx.settings.findUnique({
        where: { userId: guestUserId },
      });
      const targetSettings = await tx.settings.findUnique({
        where: { userId: targetUserId },
      });

      if (guestSettings && targetSettings) {
        await tx.settings.update({
          where: { userId: targetUserId },
          data: {
            xp: targetSettings.xp + guestSettings.xp,
            totalPomodoros:
              targetSettings.totalPomodoros + guestSettings.totalPomodoros,
            totalTasksCompleted:
              targetSettings.totalTasksCompleted +
              guestSettings.totalTasksCompleted,
            totalReviewsCompleted:
              targetSettings.totalReviewsCompleted +
              guestSettings.totalReviewsCompleted,
            totalFocusMinutes:
              targetSettings.totalFocusMinutes +
              guestSettings.totalFocusMinutes,
            awardedTaskIds: Array.from(
              new Set([
                ...targetSettings.awardedTaskIds,
                ...guestSettings.awardedTaskIds,
              ]),
            ),
            awardedReviewIds: Array.from(
              new Set([
                ...targetSettings.awardedReviewIds,
                ...guestSettings.awardedReviewIds,
              ]),
            ),
            currentStreak: Math.max(
              targetSettings.currentStreak,
              guestSettings.currentStreak,
            ),
            challengeStartDate:
              guestSettings.challengeStartDate < targetSettings.challengeStartDate
                ? guestSettings.challengeStartDate
                : targetSettings.challengeStartDate,
          },
        });
      } else if (guestSettings && !targetSettings) {
        await tx.settings.update({
          where: { userId: guestUserId },
          data: { userId: targetUserId },
        });
      }

      const targetPlan = await tx.plan.findUnique({
        where: { userId: targetUserId },
      });
      if (!targetPlan) {
        await tx.plan.updateMany({
          where: { userId: guestUserId },
          data: { userId: targetUserId },
        });
      }

      // Cascade delete on User cleans up any Settings/Plan/etc. still
      // pointing at the guest row (the branches above already reparented
      // or merged everything worth keeping).
      await tx.user.delete({ where: { id: guestUserId } });
    });
  }

  private async buildSession(user: SessionUser, meta?: SessionMeta) {
    if (meta) {
      await this.prisma.user
        .update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            lastLoginIp: meta.ip,
            lastLoginUserAgent: meta.userAgent,
          },
        })
        .catch(() => {
          // Best-effort — never block a session on this.
        });
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      isGuest: user.isGuest,
      guestExpiresAt: user.guestExpiresAt ? user.guestExpiresAt.getTime() : null,
    });

    return {
      accessToken,
      user: this.usersService.toPublic(user),
    };
  }
}
