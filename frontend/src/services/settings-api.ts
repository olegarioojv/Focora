import { apiGet, apiPatch, apiPost } from './api-client'

export interface SettingsResponse {
  id: string
  theme: 'light' | 'dark'
  defaultDurationMinutes: number
  defaultBreakMinutes: number
  notifyOnComplete: boolean
  dailyGoalPomodoros: number
  xp: number
  totalPomodoros: number
  totalTasksCompleted: number
  totalReviewsCompleted: number
  awardedTaskIds: string[]
  awardedReviewIds: string[]
  challengeStartDate: string
  currentStreak: number
  lastActiveDate: string | null
  totalFocusMinutes: number
}

export interface UpdateSettingsInput {
  theme?: 'light' | 'dark'
  defaultDurationMinutes?: number
  defaultBreakMinutes?: number
  notifyOnComplete?: boolean
  dailyGoalPomodoros?: number
}

export interface DailyLogResponse {
  id: string
  date: string
  minutes: number
  pomodoros: number
}

export interface RankingEntryResponse {
  id: string
  name: string
  avatarUrl: string | null
  xp: number
}

export const settingsApi = {
  get: () => apiGet<SettingsResponse>('/settings'),
  update: (input: UpdateSettingsInput) =>
    apiPatch<SettingsResponse>('/settings', input),
  awardPomodoro: (durationMinutes: number) =>
    apiPost<SettingsResponse>('/settings/award-pomodoro', { durationMinutes }),
  awardTask: (taskId: string) =>
    apiPost<SettingsResponse>('/settings/award-task', { taskId }),
  awardReview: (reviewId: string) =>
    apiPost<SettingsResponse>('/settings/award-review', { reviewId }),
}

export const dailyLogsApi = {
  list: () => apiGet<DailyLogResponse[]>('/settings/daily-logs'),
}

export const rankingApi = {
  list: () => apiGet<RankingEntryResponse[]>('/settings/ranking'),
}
