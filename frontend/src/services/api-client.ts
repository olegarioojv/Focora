import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const CSRF_HEADER = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD'])

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// The backend and frontend can live on different registrable domains in
// production (e.g. Vercel + Railway) — `document.cookie` on this page can
// never see a cookie set by a response from a different site, so reading
// the CSRF cookie directly doesn't work there (it silently returns
// nothing, and every mutating request gets rejected as a forged request).
// The backend instead echoes the current token back as a response header
// on every request (see csrf.middleware.ts); cache that here and send it
// back as the next mutating request's header — this works identically
// whether frontend and API share a domain or not.
let cachedCsrfToken: string | undefined

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET'

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(!SAFE_METHODS.has(method) && cachedCsrfToken
        ? { [CSRF_HEADER]: cachedCsrfToken }
        : {}),
      ...options.headers,
    },
  })

  const freshToken = response.headers.get(CSRF_HEADER)
  if (freshToken) cachedCsrfToken = freshToken

  if (!response.ok) {
    const body = await response.json().catch(() => null)

    if (body?.code === 'GUEST_TRIAL_EXPIRED') {
      useGuestTrialStore.getState().setExpired(true)
    } else if (
      body?.code === 'ACCOUNT_BLOCKED' ||
      // A 401 while we believe we're logged in means the session went
      // stale/invalid mid-use (cookie expired, user deleted, etc.) — that's
      // an anomaly worth a hard reload. A 401 with no user in the store yet
      // is just AuthBootstrap's normal "am I logged in?" probe on a fresh
      // visit with no cookie, and must NOT reload (that would loop forever,
      // since the reloaded page immediately re-probes and 401s again).
      (response.status === 401 && useAuthStore.getState().user !== null)
    ) {
      // Clearing the session alone left the app showing stale cached data
      // indefinitely — nothing re-triggered AuthBootstrap or told the user
      // anything had changed. A full reload re-runs bootstrap from
      // scratch (provisioning a fresh guest session), which is the
      // simplest reliable recovery from a dead/blocked session mid-use.
      useAuthStore.getState().clearSession()
      if (typeof window !== 'undefined') {
        window.location.href = '/app'
      }
    }

    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? 'Erro inesperado no servidor')
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  // Nest sends 200 with an empty body for handlers that resolve to void
  // (e.g. DELETE endpoints) rather than 204 — response.json() throws on
  // an empty body, so read as text first and only parse if non-empty.
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export function apiPatch<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'PATCH',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export function apiDelete<T>(path: string) {
  return request<T>(path, { method: 'DELETE' })
}
