import type { Weekday } from './plan'

export type DayPlanCategory = 'Estudos' | 'Revisão'

export interface DayPlanEntry {
  subjectId: string
  durationMinutes: number
  repetitions: number
}

export interface DayPlanConfig {
  weekday: Weekday
  category: DayPlanCategory
  subjectCount: number
  entries: DayPlanEntry[]
}

export interface StudySession {
  id: string
  subjectId: string
  category: DayPlanCategory
  weekday: Weekday
  weekStart: string
  durationMinutes: number
  sequence: number
  position: number
  completed: boolean
}
