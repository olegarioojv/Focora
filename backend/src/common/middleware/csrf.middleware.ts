import { randomBytes } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  csrfCookieOptions,
} from '../../auth/cookie.constants';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Session-creation routes can't carry the CSRF header yet — nothing has
// set the cookie for this browser before the first request arrives.
const EXEMPT_PATHS = new Set(['/auth/guest', '/auth/register', '/auth/login']);

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let token = req.cookies?.[CSRF_COOKIE] as string | undefined;
  if (!token) {
    token = randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, csrfCookieOptions());
  }

  if (SAFE_METHODS.has(req.method) || EXEMPT_PATHS.has(req.path)) {
    next();
    return;
  }

  const header = req.headers[CSRF_HEADER];
  if (header !== token) {
    res.status(403).json({ statusCode: 403, message: 'CSRF token inválido' });
    return;
  }

  next();
}
