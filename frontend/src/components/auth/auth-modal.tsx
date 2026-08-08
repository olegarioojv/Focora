import { useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'
import { useAuthModalStore } from '@/stores/auth-modal-store'
import { API_URL } from '@/services/api-client'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.86c2.26-2.08 3.56-5.14 3.56-8.89z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.02c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.11A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.26A7.2 7.2 0 0 1 4.89 12c0-.78.14-1.55.38-2.26V6.63H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.37z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
    </svg>
  )
}

export function AuthModal() {
  const location = useLocation()
  const isGuest = useAuthStore((state) => state.user?.isGuest ?? false)
  const expired = useGuestTrialStore((state) => state.expired)
  const { open, tab, setTab, close } = useAuthModalStore()

  const forced = isGuest && expired
  const isOpen = open || forced

  function startOAuth(provider: 'google' | 'github') {
    sessionStorage.setItem('oauth-return-path', location.pathname)
    // The existing guest session's httpOnly cookie persists naturally
    // through this top-level redirect, so the backend can detect a prior
    // guest session on its own — no need to smuggle a token in the URL.
    window.location.href = `${API_URL}/auth/${provider}`
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && !forced) close()
      }}
    >
      <DialogContent
        showCloseButton={!forced}
        onEscapeKeyDown={(event) => forced && event.preventDefault()}
        onPointerDownOutside={(event) => forced && event.preventDefault()}
        onInteractOutside={(event) => forced && event.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>
            {forced ? 'Seu período de teste terminou.' : 'Entrar no Focora'}
          </DialogTitle>
        </DialogHeader>

        {forced && (
          <p className="text-sm text-muted-foreground">
            Crie uma conta ou faça login para continuar acompanhando sua
            evolução e salvar seu progresso.
          </p>
        )}

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === 'login'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === 'register'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Criar conta
          </button>
        </div>

        {tab === 'login' ? (
          <LoginForm onSuccess={close} />
        ) : (
          <RegisterForm onSuccess={close} />
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          ou
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => startOAuth('google')}
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-accent"
          >
            <GoogleIcon />
            Continuar com Google
          </button>
          <button
            type="button"
            onClick={() => startOAuth('github')}
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-accent"
          >
            <GithubIcon />
            Continuar com GitHub
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
