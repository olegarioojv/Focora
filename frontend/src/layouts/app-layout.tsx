import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { AuthModal } from '@/components/auth/auth-modal'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'

const CHECK_INTERVAL_MS = 30_000

export function AppLayout() {
  const isGuest = useAuthStore((state) => state.user?.isGuest ?? false)
  const guestExpiresAt = useAuthStore((state) => state.user?.guestExpiresAt ?? null)
  const setExpired = useGuestTrialStore((state) => state.setExpired)

  useEffect(() => {
    if (!isGuest || !guestExpiresAt) return

    function checkExpiry() {
      if (Date.now() > new Date(guestExpiresAt!).getTime()) {
        setExpired(true)
      }
    }

    checkExpiry()
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isGuest, guestExpiresAt, setExpired])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 p-6">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
      <AuthModal />
    </div>
  )
}
