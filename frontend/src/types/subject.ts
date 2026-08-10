import type { Weekday } from './plan'

/** Star rating from 1 (lowest) to 5 (highest). */
export type SubjectPriority = number

export interface Subject {
  id: string
  name: string
  color: string
  priority: SubjectPriority
  goal: string
  totalLessons: number | null
  completedLessons: number
  /** Days this subject may be scheduled on. Empty array means any day. */
  preferredDays: Weekday[]
  imageUrl: string | null
}
