import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { UsersService } from '../users/users.service';

type AuthUserPublic = ReturnType<UsersService['toPublic']>;

const CODE_TTL_MS = 60_000;

interface ExchangeEntry {
  accessToken: string;
  user: AuthUserPublic;
  expiresAt: number;
}

// Single-use, short-lived handoff between the OAuth callback's top-level
// redirect and the frontend's follow-up fetch. Deliberately in-memory: the
// code is meaningless outside a ~1-minute window and this only ever needs
// to survive a single browser redirect, not a service restart or a second
// replica. If this app ever runs multiple instances, this needs to move to
// a shared store (Redis) — a code created on instance A wouldn't be found
// by instance B.
@Injectable()
export class OAuthExchangeService {
  private readonly codes = new Map<string, ExchangeEntry>();

  create(accessToken: string, user: AuthUserPublic): string {
    const code = randomBytes(32).toString('hex');
    this.codes.set(code, {
      accessToken,
      user,
      expiresAt: Date.now() + CODE_TTL_MS,
    });
    return code;
  }

  consume(code: string): { accessToken: string; user: AuthUserPublic } | null {
    const entry = this.codes.get(code);
    this.codes.delete(code);
    if (!entry || entry.expiresAt < Date.now()) return null;
    return { accessToken: entry.accessToken, user: entry.user };
  }
}
