import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
