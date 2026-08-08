import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ACCESS_TOKEN_COOKIE } from '../cookie.constants';

function extractFromCookie(req: Request): string | null {
  return (req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined) ?? null;
}

interface JwtPayload {
  sub: string;
  email: string | null;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Re-checked against the database on every request (not just trusted
  // from the JWT claims) so blocking a user or expiring a guest trial
  // takes effect immediately, without waiting for the token to expire.
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        isGuest: true,
        guestExpiresAt: true,
        blocked: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      user.isGuest &&
      user.guestExpiresAt !== null &&
      user.guestExpiresAt.getTime() < Date.now()
    ) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'GUEST_TRIAL_EXPIRED',
        message: 'Seu período de teste terminou.',
      });
    }

    if (user.blocked) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'ACCOUNT_BLOCKED',
        message: 'Sua conta foi bloqueada.',
      });
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      isGuest: user.isGuest,
      role: user.role,
    };
  }
}
