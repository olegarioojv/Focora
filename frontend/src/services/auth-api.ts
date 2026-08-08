import { apiPost } from './api-client'
import type { AuthUser } from '@/stores/auth-store'

interface AuthResponse {
  user: AuthUser
}

export const authApi = {
  guest: () => apiPost<AuthResponse>('/auth/guest'),
  register: (data: { name: string; email: string; password: string }) =>
    apiPost<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiPost<AuthResponse>('/auth/login', data),
  logout: () => apiPost<{ ok: true }>('/auth/logout'),
}
