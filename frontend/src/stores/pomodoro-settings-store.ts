import { create } from 'zustand'
import { toast } from 'sonner'
import { settingsApi, type SettingsResponse } from '@/services/settings-api'
import { ApiError } from '@/services/api-client'

interface PomodoroSettingsState {
  defaultDurationMinutes: number
  defaultBreakMinutes: number
  notifyOnComplete: boolean
  dailyGoalPomodoros: number
  hydrate: (settings: SettingsResponse) => void
  reset: () => void
  setDefaultDurationMinutes: (minutes: number) => void
  setDefaultBreakMinutes: (minutes: number) => void
  setNotifyOnComplete: (value: boolean) => void
  setDailyGoalPomodoros: (value: number) => void
}

const defaults = {
  defaultDurationMinutes: 25,
  defaultBreakMinutes: 15,
  notifyOnComplete: false,
  dailyGoalPomodoros: 4,
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

export const usePomodoroSettingsStore = create<PomodoroSettingsState>()(
  (set) => ({
    ...defaults,
    hydrate: (settings) =>
      set({
        defaultDurationMinutes: settings.defaultDurationMinutes,
        defaultBreakMinutes: settings.defaultBreakMinutes,
        notifyOnComplete: settings.notifyOnComplete,
        dailyGoalPomodoros: settings.dailyGoalPomodoros,
      }),
    reset: () => set(defaults),
    setDefaultDurationMinutes: (minutes) => {
      set({ defaultDurationMinutes: minutes })
      settingsApi
        .update({ defaultDurationMinutes: minutes })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
    setDefaultBreakMinutes: (minutes) => {
      set({ defaultBreakMinutes: minutes })
      settingsApi
        .update({ defaultBreakMinutes: minutes })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
    setNotifyOnComplete: (value) => {
      set({ notifyOnComplete: value })
      settingsApi
        .update({ notifyOnComplete: value })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
    setDailyGoalPomodoros: (value) => {
      set({ dailyGoalPomodoros: value })
      settingsApi
        .update({ dailyGoalPomodoros: value })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
  }),
)
