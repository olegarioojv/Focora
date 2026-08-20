export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

export interface Flashcard {
  id: string
  front: string
  back: string
  noteId: string | null
  subjectId: string | null
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewDate: string
  lastReviewedAt: string | null
  createdAt: string
  updatedAt: string
  tags: string[]
}
