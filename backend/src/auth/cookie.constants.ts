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
//
// Deliberately NOT using `Partitioned` (CHIPS), even though browsers warn
// about it: a `Partitioned` cookie's storage is keyed to whichever
// top-level site was active when it was set. The OAuth login flow sets
// this cookie mid-redirect while the browser is briefly ON the API's own
// domain (a first-party moment) before landing back on the frontend — so
// the cookie gets partitioned under the API's own site, and is then
// invisible to the frontend's later same cross-site fetches (partition key
// mismatch: set under the API's site, looked up under the frontend's
// site). That silently logged OAuth users back out as guests. Regular
// email/password/guest logins never hit this because the cookie is always
// both set AND read from the same cross-site fetch context. SameSite=None
// alone is sufficient for our case (a legitimate cross-site API cookie,
// not third-party tracking storage), so it's fine to skip CHIPS here.
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false, // must be JS-readable — the frontend echoes it back as a header
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}
