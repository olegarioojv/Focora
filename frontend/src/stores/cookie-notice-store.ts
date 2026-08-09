import { create } from 'zustand'

interface CookieNoticeState {
  open: boolean
  show: () => void
  close: () => void
}

export const useCookieNoticeStore = create<CookieNoticeState>()((set) => ({
  open: false,
  show: () => set({ open: true }),
  close: () => set({ open: false }),
}))
