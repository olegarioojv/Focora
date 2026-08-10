import { create } from 'zustand'
import { toast } from 'sonner'
import { settingsApi, type SettingsResponse } from '@/services/settings-api'
import { ApiError } from '@/services/api-client'

export type PomodoroSoundStage =
  | 'pomodoroFocusStartSound'
  | 'pomodoroFocusEndSound'
  | 'pomodoroBreakStartSound'
  | 'pomodoroBreakEndSound'

interface PomodoroSettingsState {
  defaultDurationMinutes: number
  defaultBreakMinutes: number
  notifyOnComplete: boolean
  dailyGoalPomodoros: number
  pomodoroSoundsEnabled: boolean
  pomodoroSoundVolume: number
  pomodoroFocusStartSound: string
  pomodoroFocusEndSound: string
  pomodoroBreakStartSound: string
  pomodoroBreakEndSound: string
  hydrate: (settings: SettingsResponse) => void
  reset: () => void
  setDefaultDurationMinutes: (minutes: number) => void
  setDefaultBreakMinutes: (minutes: number) => void
  setNotifyOnComplete: (value: boolean) => void
  setDailyGoalPomodoros: (value: number) => void
  setPomodoroSoundsEnabled: (value: boolean) => void
  setPomodoroSoundVolume: (value: number) => void
  setPomodoroStageSound: (stage: PomodoroSoundStage, soundKey: string) => void
}

const defaults = {
  defaultDurationMinutes: 25,
  defaultBreakMinutes: 15,
  notifyOnComplete: false,
  dailyGoalPomodoros: 4,
  pomodoroSoundsEnabled: true,
  pomodoroSoundVolume: 70,
  pomodoroFocusStartSound: 'sino',
  pomodoroFocusEndSound: 'classico',
  pomodoroBreakStartSound: 'suave',
  pomodoroBreakEndSound: 'digital',
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
        pomodoroSoundsEnabled: settings.pomodoroSoundsEnabled,
        pomodoroSoundVolume: settings.pomodoroSoundVolume,
        pomodoroFocusStartSound: settings.pomodoroFocusStartSound,
        pomodoroFocusEndSound: settings.pomodoroFocusEndSound,
        pomodoroBreakStartSound: settings.pomodoroBreakStartSound,
        pomodoroBreakEndSound: settings.pomodoroBreakEndSound,
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
    setPomodoroSoundsEnabled: (value) => {
      set({ pomodoroSoundsEnabled: value })
      settingsApi
        .update({ pomodoroSoundsEnabled: value })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
    setPomodoroSoundVolume: (value) => {
      set({ pomodoroSoundVolume: value })
      settingsApi
        .update({ pomodoroSoundVolume: value })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
    setPomodoroStageSound: (stage, soundKey) => {
      set({ [stage]: soundKey })
      settingsApi
        .update({ [stage]: soundKey })
        .catch((error) => reportError(error, 'Não foi possível salvar'))
    },
  }),
)
