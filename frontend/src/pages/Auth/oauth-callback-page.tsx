import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'
import { usersApi } from '@/services/users-api'
import { syncUserData } from '@/hooks/use-sync-user-data'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useAuthStore((state) => state.setUser)
  const setExpired = useGuestTrialStore((state) => state.setExpired)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function completeOAuthLogin() {
      const error = searchParams.get('error')
      if (error) throw new Error(error)

      // The backend already set the httpOnly auth cookie before redirecting
      // here — just ask who we are now.
      const user = await usersApi.me()
      setUser(user)
      setExpired(false)
      await syncUserData()
    }

    completeOAuthLogin()
      .then(() => {
        const returnPath = sessionStorage.getItem('oauth-return-path') ?? '/app'
        sessionStorage.removeItem('oauth-return-path')
        navigate(returnPath, { replace: true })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error && error.message
          ? error.message
          : 'Não foi possível concluir o login'
        toast.error(message)
        navigate('/app', { replace: true })
      })
  }, [searchParams, setUser, setExpired, navigate])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
      Concluindo login...
    </div>
  )
}
