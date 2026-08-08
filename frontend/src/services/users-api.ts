import { apiGet, apiPatch } from './api-client'
import type { AuthUser } from '@/stores/auth-store'

export interface UpdateMeInput {
  name?: string
  avatarUrl?: string | null
}

export const usersApi = {
  me: () => apiGet<AuthUser>('/users/me'),
  update: (input: UpdateMeInput) => apiPatch<AuthUser>('/users/me', input),
}
