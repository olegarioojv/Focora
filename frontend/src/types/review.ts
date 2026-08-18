/** Spaced-repetition intervals, in growing order. A subject's `reviewCount`
 * takes the first N of these — max 8 keeps the sequence finite. */
export const REVIEW_INTERVAL_SEQUENCE = [1, 3, 7, 15, 30, 60, 90, 120] as const
export type ReviewInterval = (typeof REVIEW_INTERVAL_SEQUENCE)[number]

export interface Review {
  id: string
  subjectId: string
  sourceTaskId: string
  intervalDays: ReviewInterval
  dueDate: string
  durationMinutes: number
  completed: boolean
  notified: boolean
}
