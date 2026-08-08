import { create } from 'zustand'
import { toast } from 'sonner'
import { settingsApi, type SettingsResponse } from '@/services/settings-api'
import { ApiError } from '@/services/api-client'

interface GamificationState {
  xp: number
  totalPomodoros: number
  totalTasksCompleted: number
  totalReviewsCompleted: number
  awardedTaskIds: string[]
  awardedReviewIds: string[]
  challengeStartDate: string
  currentStreak: number
  totalFocusMinutes: number
  hydrate: (settings: SettingsResponse) => void
  reset: () => void
  addPomodoroXP: (durationMinutes: number) => void
  awardTaskXP: (taskId: string) => void
  awardReviewXP: (reviewId: string) => void
}

const emptyState = {
  xp: 0,
  totalPomodoros: 0,
  totalTasksCompleted: 0,
  totalReviewsCompleted: 0,
  awardedTaskIds: [] as string[],
  awardedReviewIds: [] as string[],
  challengeStartDate: new Date().toISOString(),
  currentStreak: 0,
  totalFocusMinutes: 0,
}

function applySettings(settings: SettingsResponse) {
  return {
    xp: settings.xp,
    totalPomodoros: settings.totalPomodoros,
    totalTasksCompleted: settings.totalTasksCompleted,
    totalReviewsCompleted: settings.totalReviewsCompleted,
    awardedTaskIds: settings.awardedTaskIds,
    awardedReviewIds: settings.awardedReviewIds,
    challengeStartDate: settings.challengeStartDate,
    currentStreak: settings.currentStreak,
    totalFocusMinutes: settings.totalFocusMinutes,
  }
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  ...emptyState,
  hydrate: (settings) => set(applySettings(settings)),
  reset: () => set(emptyState),
  addPomodoroXP: (durationMinutes) => {
    settingsApi
      .awardPomodoro(durationMinutes)
      .then((settings) => set(applySettings(settings)))
      .catch((error) => reportError(error, 'Não foi possível salvar seu XP'))
  },
  // Award-once-per-id is enforced by the server; the local check here is
  // just an optimization to skip a redundant request.
  awardTaskXP: (taskId) => {
    if (get().awardedTaskIds.includes(taskId)) return
    settingsApi
      .awardTask(taskId)
      .then((settings) => set(applySettings(settings)))
      .catch((error) => reportError(error, 'Não foi possível salvar seu XP'))
  },
  awardReviewXP: (reviewId) => {
    if (get().awardedReviewIds.includes(reviewId)) return
    settingsApi
      .awardReview(reviewId)
      .then((settings) => set(applySettings(settings)))
      .catch((error) => reportError(error, 'Não foi possível salvar seu XP'))
  },
}))
