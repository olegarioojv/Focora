export const ACCESS_TOKEN_COOKIE = 'focora_token';
export const CSRF_COOKIE = 'focora_csrf';
export const CSRF_HEADER = 'x-csrf-token';

// 7 days, matching the default JWT_EXPIRES_IN — if that env var is
// customized the cookie may outlive (or die slightly before) the token,
// which is harmless: the browser just keeps resending an already-expired
// cookie until this window closes, or drops a still-valid one a bit early.
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === 'production';

// The frontend never talks to this API directly in the browser — in
// production it calls its own origin (focora-eight.vercel.app/api/*),
// which Vercel transparently rewrites to this backend (see frontend's
// vercel.json). As far as the browser is concerned, every request is
// same-origin, so the cookie is a completely ordinary first-party cookie:
// SameSite=Lax works everywhere, no browser-specific cross-site cookie
// rules (Safari ITP, Chrome's third-party phase-out, CHIPS/Partitioned)
// apply at all. Only `secure` still needs to be conditional — local dev
// runs over plain HTTP, which Secure cookies refuse to attach to.
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false, // must be JS-readable — the frontend echoes it back as a header
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}
