import { apiDelete, apiGet, apiPatch, apiPost } from './api-client'
import type { Flashcard, FlashcardRating } from '@/types/flashcard'

interface RawTagResponse {
  id: string
  userId: string
  name: string
  createdAt: string
}

interface RawFlashcardTagResponse {
  tag: RawTagResponse
}

export interface RawFlashcardResponse {
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
  tags: RawFlashcardTagResponse[]
}

export function mapFlashcardResponse(raw: RawFlashcardResponse): Flashcard {
  return {
    id: raw.id,
    front: raw.front,
    back: raw.back,
    noteId: raw.noteId,
    subjectId: raw.subjectId,
    easeFactor: raw.easeFactor,
    intervalDays: raw.intervalDays,
    repetitions: raw.repetitions,
    nextReviewDate: raw.nextReviewDate,
    lastReviewedAt: raw.lastReviewedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    tags: raw.tags.map((t) => t.tag.name),
  }
}

export interface CreateFlashcardInput {
  front: string
  back: string
  noteId?: string | null
  subjectId?: string | null
  tags?: string[]
}

export type UpdateFlashcardInput = Partial<CreateFlashcardInput>

export const flashcardsApi = {
  list: () =>
    apiGet<RawFlashcardResponse[]>('/flashcards').then((rows) =>
      rows.map(mapFlashcardResponse),
    ),
  create: (input: CreateFlashcardInput) =>
    apiPost<RawFlashcardResponse>('/flashcards', input).then(
      mapFlashcardResponse,
    ),
  update: (id: string, input: UpdateFlashcardInput) =>
    apiPatch<RawFlashcardResponse>(`/flashcards/${id}`, input).then(
      mapFlashcardResponse,
    ),
  remove: (id: string) => apiDelete<void>(`/flashcards/${id}`),
  review: (id: string, rating: FlashcardRating) =>
    apiPost<RawFlashcardResponse>(`/flashcards/${id}/review`, {
      rating,
    }).then(mapFlashcardResponse),
}
