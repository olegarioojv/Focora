export const REVIEW_INTERVALS = [1, 3, 7, 15, 30] as const
export type ReviewInterval = (typeof REVIEW_INTERVALS)[number]

export interface Review {
  id: string
  subjectId: string
  sourceTaskId: string
  intervalDays: ReviewInterval
  dueDate: string
  completed: boolean
  notified: boolean
}
