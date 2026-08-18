import { create } from 'zustand'
import { toast } from 'sonner'
import type { Flashcard, FlashcardRating } from '@/types/flashcard'
import {
  flashcardsApi,
  type CreateFlashcardInput,
  type UpdateFlashcardInput,
} from '@/services/flashcards-api'
import { ApiError } from '@/services/api-client'

interface FlashcardsState {
  flashcards: Flashcard[]
  hydrate: (flashcards: Flashcard[]) => void
  addFlashcard: (input: CreateFlashcardInput) => Promise<Flashcard>
  updateFlashcard: (id: string, input: UpdateFlashcardInput) => Promise<void>
  removeFlashcard: (id: string) => Promise<void>
  reviewFlashcard: (id: string, rating: FlashcardRating) => Promise<void>
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

const DEFAULT_EASE_FACTOR = 2.5

export const useFlashcardsStore = create<FlashcardsState>()((set, get) => ({
  flashcards: [],
  hydrate: (flashcards) => set({ flashcards }),
  addFlashcard: (input) => {
    const tempId = crypto.randomUUID()
    const now = new Date().toISOString()
    const optimisticFlashcard: Flashcard = {
      id: tempId,
      front: input.front,
      back: input.back,
      noteId: input.noteId ?? null,
      subjectId: input.subjectId ?? null,
      easeFactor: DEFAULT_EASE_FACTOR,
      intervalDays: 0,
      repetitions: 0,
      nextReviewDate: now.slice(0, 10),
      lastReviewedAt: null,
      createdAt: now,
      updatedAt: now,
      tags: input.tags ?? [],
    }

    set((state) => ({
      flashcards: [...state.flashcards, optimisticFlashcard],
    }))

    return flashcardsApi
      .create(input)
      .then((created) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === tempId ? created : card,
          ),
        }))
        return created
      })
      .catch((error) => {
        set((state) => ({
          flashcards: state.flashcards.filter((card) => card.id !== tempId),
        }))
        reportError(error, 'Não foi possível criar o flashcard')
        throw error
      })
  },
  updateFlashcard: (id, input) => {
    const previous = get().flashcards
    set((state) => ({
      flashcards: state.flashcards.map((card) =>
        card.id === id ? { ...card, ...input } : card,
      ),
    }))

    return flashcardsApi
      .update(id, input)
      .then((updated) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? updated : card,
          ),
        }))
      })
      .catch((error) => {
        set({ flashcards: previous })
        reportError(error, 'Não foi possível salvar o flashcard')
        throw error
      })
  },
  removeFlashcard: (id) => {
    const previous = get().flashcards
    set((state) => ({
      flashcards: state.flashcards.filter((card) => card.id !== id),
    }))

    return flashcardsApi
      .remove(id)
      .catch((error) => {
        set({ flashcards: previous })
        reportError(error, 'Não foi possível remover o flashcard')
        throw error
      })
  },
  reviewFlashcard: (id, rating) => {
    return flashcardsApi
      .review(id, rating)
      .then((updated) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? updated : card,
          ),
        }))
      })
      .catch((error) => {
        reportError(error, 'Não foi possível registrar a revisão')
        throw error
      })
  },
}))

export interface DueBuckets {
  overdue: Flashcard[]
  today: Flashcard[]
  upcoming: Flashcard[]
}

export function getDueBuckets(
  flashcards: Flashcard[],
  todayIso: string,
): DueBuckets {
  const overdue: Flashcard[] = []
  const today: Flashcard[] = []
  const upcoming: Flashcard[] = []

  for (const card of flashcards) {
    if (card.nextReviewDate < todayIso) overdue.push(card)
    else if (card.nextReviewDate === todayIso) today.push(card)
    else upcoming.push(card)
  }

  overdue.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
  upcoming.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))

  return { overdue, today, upcoming }
}
