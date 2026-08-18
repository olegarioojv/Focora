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
  imageUrl: string | null
  /** Spaced reviews to schedule after completing a task of this subject. 0 disables it. */
  reviewCount: number
  reviewDurationMinutes: number
}
