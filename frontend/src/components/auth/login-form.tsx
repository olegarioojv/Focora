import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/services/auth-api'
import { ApiError } from '@/services/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'
import { useCookieNoticeStore } from '@/stores/cookie-notice-store'
import { syncUserData } from '@/hooks/use-sync-user-data'
import { isSessionPersisted } from '@/utils/verify-session'
import { loginSchema, type LoginFormValues } from '@/pages/Auth/auth-form-schema'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const setUser = useAuthStore((state) => state.setUser)
  const setExpired = useGuestTrialStore((state) => state.setExpired)
  const showCookieNotice = useCookieNoticeStore((state) => state.show)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      const { user } = await authApi.login(values)
      setUser(user)
      setExpired(false)
      if (!(await isSessionPersisted())) {
        onSuccess()
        showCookieNotice()
        return
      }
      await syncUserData()
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível entrar',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="login-email"
        >
          E-mail
        </label>
        <Input
          id="login-email"
          type="email"
          placeholder="voce@email.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="login-password"
        >
          Senha
        </label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
