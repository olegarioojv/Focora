import { create } from 'zustand'
import type { DailyLogResponse } from '@/services/settings-api'

interface DailyLogsState {
  dailyLogs: DailyLogResponse[]
  hydrate: (dailyLogs: DailyLogResponse[]) => void
  reset: () => void
}

export const useDailyLogsStore = create<DailyLogsState>()((set) => ({
  dailyLogs: [],
  hydrate: (dailyLogs) => set({ dailyLogs }),
  reset: () => set({ dailyLogs: [] }),
}))
