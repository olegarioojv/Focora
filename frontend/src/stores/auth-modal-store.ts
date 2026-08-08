import { create } from 'zustand'

export type AuthModalTab = 'login' | 'register'

interface AuthModalState {
  open: boolean
  tab: AuthModalTab
  setTab: (tab: AuthModalTab) => void
  openLogin: () => void
  openRegister: () => void
  close: () => void
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  open: false,
  tab: 'login',
  setTab: (tab) => set({ tab }),
  openLogin: () => set({ open: true, tab: 'login' }),
  openRegister: () => set({ open: true, tab: 'register' }),
  close: () => set({ open: false }),
}))
