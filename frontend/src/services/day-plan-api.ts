import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './api-client'
import type {
  DayPlanCategory,
  DayPlanConfig,
  DayPlanEntry,
  StudySession,
} from '@/types/day-plan'
import type { Weekday } from '@/types/plan'

export interface UpsertDayPlanInput {
  subjectCount: number
  entries: DayPlanEntry[]
}

export interface CreateSessionInput {
  subjectId: string
  category: DayPlanCategory
  weekday: Weekday
  durationMinutes: number
  weekStart: string
}

export interface ReorderChange {
  weekday: Weekday
  orderedIds: string[]
}

export interface DailySessionEntry {
  id: string
  subjectId: string
  subjectName: string
  category: DayPlanCategory
  durationMinutes: number
  completedAt: string
}

export const dayPlanApi = {
  listConfigs: () => apiGet<DayPlanConfig[]>('/day-plan/configs'),
  upsertConfig: (
    weekday: Weekday,
    category: DayPlanCategory,
    input: UpsertDayPlanInput,
  ) =>
    apiPut<DayPlanConfig>(
      `/day-plan/configs/${weekday}/${encodeURIComponent(category)}`,
      input,
    ),
  listSessions: (weekStart: string) =>
    apiGet<StudySession[]>(`/day-plan/sessions?weekStart=${weekStart}`),
  listSessionsByDate: (date: string) =>
    apiGet<DailySessionEntry[]>(`/day-plan/sessions/by-date?date=${date}`),
  sync: (weekStart: string) =>
    apiPost<StudySession[]>('/day-plan/sync', { weekStart }),
  createSession: (input: CreateSessionInput) =>
    apiPost<StudySession>('/day-plan/sessions', input),
  updateSession: (id: string, completed: boolean) =>
    apiPatch<StudySession>(`/day-plan/sessions/${id}`, { completed }),
  removeSession: (id: string) => apiDelete<void>(`/day-plan/sessions/${id}`),
  reorder: (changes: ReorderChange[]) =>
    apiPut<StudySession[]>('/day-plan/sessions/reorder', { changes }),
}
