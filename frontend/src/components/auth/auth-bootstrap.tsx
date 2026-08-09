import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/services/auth-api'
import { usersApi } from '@/services/users-api'
import { syncUserData } from '@/hooks/use-sync-user-data'
import { ApiError } from '@/services/api-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

type BootstrapStatus = 'loading' | 'ready' | 'error'

/** On app boot: the auth cookie (if any) is sent automatically, so ask the
 * server who we are first. A 401 means there's no valid session yet (first
 * visit, or an expired/cleared cookie) — provision a fresh guest session in
 * that case. This avoids ever trusting client-side state about whether a
 * session exists, since the token itself now lives only in an httpOnly
 * cookie the client can't read. */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser)
  const [status, setStatus] = useState<BootstrapStatus>('loading')

  async function bootstrap() {
    setStatus('loading')
    try {
      try {
        const user = await usersApi.me()
        setUser(user)
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error
        const session = await authApi.guest()
        setUser(session.user)
      }
      await syncUserData()
      setStatus('ready')
    } catch (error) {
      // 401/blocked and GUEST_TRIAL_EXPIRED already get their own dedicated
      // screens (api-client clears the session / sets the expired flag
      // before throwing) — surfacing an error here too would just fight
      // with those. Only a genuine failure (network down, 5xx) lands here,
      // and it used to fail silently: stores stayed empty and the
      // dashboard rendered as if the user simply had zero data.
      const handledElsewhere =
        error instanceof ApiError && (error.status === 401 || error.status === 403)
      setStatus(handledElsewhere ? 'ready' : 'error')
    }
  }

  useEffect(() => {
    // /oauth-callback handles its own auth (exchanging the one-time code
    // for the real session cookie) — provisioning a guest here first would
    // both be wasted work and, worse, a race: the guest cookie this would
    // set could still be in flight when the callback page's exchange call
    // lands, and either one could "win" depending on timing.
    if (window.location.pathname === '/oauth-callback') {
      setStatus('ready')
      return
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <div className="flex h-16 shrink-0 items-center justify-end border-b border-border px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <EmptyState
          icon="📡"
          title="Não foi possível carregar seus dados"
          description="Verifique sua conexão e tente novamente."
          action={
            <Button type="button" onClick={bootstrap} className="mt-1">
              Tentar novamente
            </Button>
          }
        />
      </div>
    )
  }

  return <>{children}</>
}
