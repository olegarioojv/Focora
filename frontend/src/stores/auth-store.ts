import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  isGuest: boolean
  guestExpiresAt: string | null
  role: 'user' | 'admin'
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    { name: 'focora-auth' },
  ),
)
