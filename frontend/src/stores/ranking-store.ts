import { create } from 'zustand'
import type { RankingEntryResponse } from '@/services/settings-api'

interface RankingState {
  entries: RankingEntryResponse[]
  hydrate: (entries: RankingEntryResponse[]) => void
  reset: () => void
}

export const useRankingStore = create<RankingState>()((set) => ({
  entries: [],
  hydrate: (entries) => set({ entries }),
  reset: () => set({ entries: [] }),
}))
