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
import { syncUserData } from '@/hooks/use-sync-user-data'
import { registerSchema, type RegisterFormValues } from '@/pages/Auth/auth-form-schema'

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const setUser = useAuthStore((state) => state.setUser)
  const setExpired = useGuestTrialStore((state) => state.setExpired)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    try {
      const { user } = await authApi.register(values)
      setUser(user)
      setExpired(false)
      await syncUserData()
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível criar sua conta',
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
          htmlFor="register-name"
        >
          Nome
        </label>
        <Input
          id="register-name"
          placeholder="Seu nome"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="register-email"
        >
          E-mail
        </label>
        <Input
          id="register-email"
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
          htmlFor="register-password"
        >
          Senha
        </label>
        <Input
          id="register-password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  )
}
