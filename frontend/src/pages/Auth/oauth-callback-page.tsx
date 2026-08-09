import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'
import { useCookieNoticeStore } from '@/stores/cookie-notice-store'
import { authApi } from '@/services/auth-api'
import { syncUserData } from '@/hooks/use-sync-user-data'
import { isSessionPersisted } from '@/utils/verify-session'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useAuthStore((state) => state.setUser)
  const setExpired = useGuestTrialStore((state) => state.setExpired)
  const showCookieNotice = useCookieNoticeStore((state) => state.show)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function completeOAuthLogin() {
      const error = searchParams.get('error')
      if (error) throw new Error(error)

      const code = searchParams.get('code')
      if (!code) throw new Error('missing code')

      // Exchanging the one-time code via a normal fetch (instead of the
      // backend setting the cookie directly during the redirect) matters:
      // this fetch is a cross-site request from this page to the API,
      // exactly the context every other session cookie already works in.
      // Setting it during the redirect itself would set it in a
      // first-party context on the API's own domain instead, which strict
      // cross-site cookie partitioning (Firefox Total Cookie Protection)
      // then hides from this page entirely.
      const { user } = await authApi.exchangeOAuthCode(code)
      setUser(user)
      setExpired(false)

      if (!(await isSessionPersisted())) {
        return 'cookie-blocked' as const
      }

      await syncUserData()
      return 'ok' as const
    }

    completeOAuthLogin()
      .then((result) => {
        const returnPath = sessionStorage.getItem('oauth-return-path') ?? '/app'
        sessionStorage.removeItem('oauth-return-path')
        navigate(returnPath, { replace: true })
        if (result === 'cookie-blocked') showCookieNotice()
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error && error.message && error.message !== 'missing code'
            ? error.message
            : 'Não foi possível concluir o login'
        toast.error(message)
        navigate('/app', { replace: true })
      })
  }, [searchParams, setUser, setExpired, showCookieNotice, navigate])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
      Concluindo login...
    </div>
  )
}
