export const ACCESS_TOKEN_COOKIE = 'focora_token';
export const CSRF_COOKIE = 'focora_csrf';
export const CSRF_HEADER = 'x-csrf-token';

// 7 days, matching the default JWT_EXPIRES_IN — if that env var is
// customized the cookie may outlive (or die slightly before) the token,
// which is harmless: the browser just keeps resending an already-expired
// cookie until this window closes, or drops a still-valid one a bit early.
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === 'production';

// Cross-origin (frontend and API on different domains in production)
// cookies need SameSite=None, which browsers only honor alongside
// Secure — that requires HTTPS, which local dev over plain http doesn't
// have. Lax works fine for localhost-to-localhost (SameSite compares
// registrable domain, not port).
// SameSite=None cookies are cross-site by definition, so browsers now treat
// them as third-party storage subject to partitioning (Firefox Total Cookie
// Protection, Chrome CHIPS). Without the `Partitioned` attribute, browsers
// warn now and will start dropping the cookie outright — it still needs to
// be readable/sendable on the single site that set it (our own frontend),
// just isolated from other sites, which `partitioned` gives us for free.
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProd,
    partitioned: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false, // must be JS-readable — the frontend echoes it back as a header
    sameSite: 'lax', // CSRF cookie is NOT third-party, doesn't need SameSite=None
    secure: isProd,
    partitioned: false, // CSRF token is same-site, not third-party — no partitioning needed
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

