import { API_URL } from '@/services/api-client'

/** Call right after a login/register/OAuth response comes back with a real
 * user, to check whether the browser actually kept the httpOnly session
 * cookie the server just set. Some browsers (Safari by default, and a
 * growing share of Chrome as third-party cookies get phased out) silently
 * discard cross-site cookies — the login *response* still says success,
 * but the very next cookie-dependent request 401s, and the user is back to
 * looking like a guest. Returns false in exactly that case.
 *
 * Deliberately a raw fetch, not the shared api-client `request()` helper:
 * that helper reacts to a 401 by force-clearing the session and reloading
 * the page — exactly the noisy, confusing behavior we're trying to
 * pre-empt with a clear explanation instead. */
export async function isSessionPersisted(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/users/me`, { credentials: 'include' })
    return response.ok
  } catch {
    return false
  }
}
