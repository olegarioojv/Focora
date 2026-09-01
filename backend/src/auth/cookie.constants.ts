export const ACCESS_TOKEN_COOKIE = 'focora_token';
export const CSRF_COOKIE = 'focora_csrf';
export const CSRF_HEADER = 'x-csrf-token';

// 7 days, matching the default JWT_EXPIRES_IN — if that env var is
// customized the cookie may outlive (or die slightly before) the token,
// which is harmless: the browser just keeps resending an already-expired
// cookie until this window closes, or drops a still-valid one a bit early.
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === 'production';

// The frontend and API are deployed on different registrable domains
// (e.g. focora-frontend.onrender.com / focora-api.onrender.com — Render's
// per-service subdomains sit on a public-suffix domain, so each service is
// its own "site" for cookie purposes even without a custom domain). Every
// request from the browser is therefore genuinely cross-site, and
// SameSite=Lax cookies are only attached to top-level navigations, never
// to fetch/XHR — so with Lax here the browser silently drops both the
// auth and CSRF cookies on every API call. SameSite=None (paired with
// Secure, which the browser mandates for None) is what actually lets the
// cookie round-trip cross-site. Locally the frontend proxies same-origin
// (or origins match), so this only matters in production, which is also
// the only place `secure` (required for None) is true.
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false, // must be JS-readable — the frontend echoes it back as a header
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}
