import { create } from 'zustand'

interface GuestTrialState {
  expired: boolean
  setExpired: (expired: boolean) => void
}

export const useGuestTrialStore = create<GuestTrialState>()((set) => ({
  expired: false,
  setExpired: (expired) => set({ expired }),
}))
