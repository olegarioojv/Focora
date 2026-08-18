import { create } from 'zustand'
import { toast } from 'sonner'
import { REVIEW_INTERVAL_SEQUENCE } from '@/types/review'
import type { Review } from '@/types/review'
import { addDays, toISODate } from '@/utils/date'
import { useGamificationStore } from './gamification-store'
import { useSubjectsStore } from './subjects-store'
import { reviewsApi } from '@/services/reviews-api'
import { ApiError } from '@/services/api-client'

interface ReviewsState {
  reviews: Review[]
  hydrate: (reviews: Review[]) => void
  scheduleReviewsForTask: (subjectId: string, sourceTaskId: string) => void
  createManualReviews: (
    subjectId: string,
    count: number,
    durationMinutes: number,
  ) => void
  toggleReviewCompleted: (id: string) => void
  markNotified: (id: string) => void
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

function buildReviews(
  subjectId: string,
  sourceTaskId: string,
  count: number,
  durationMinutes: number,
): Review[] {
  const today = new Date()
  return REVIEW_INTERVAL_SEQUENCE.slice(0, count).map((intervalDays) => ({
    id: crypto.randomUUID(),
    subjectId,
    sourceTaskId,
    intervalDays,
    dueDate: toISODate(addDays(today, intervalDays)),
    durationMinutes,
    completed: false,
    notified: false,
  }))
}

export const useReviewsStore = create<ReviewsState>()((set, get) => ({
  reviews: [],
  hydrate: (reviews) => set({ reviews }),
  scheduleReviewsForTask: (subjectId, sourceTaskId) => {
    const alreadyScheduled = get().reviews.some(
      (review) => review.sourceTaskId === sourceTaskId,
    )
    if (alreadyScheduled) return

    const subject = useSubjectsStore
      .getState()
      .subjects.find((item) => item.id === subjectId)
    if (!subject || subject.reviewCount <= 0) return

    const newReviews = buildReviews(
      subjectId,
      sourceTaskId,
      subject.reviewCount,
      subject.reviewDurationMinutes,
    )

    set((state) => ({ reviews: [...state.reviews, ...newReviews] }))

    reviewsApi
      .createBatch(newReviews)
      .then((reviews) => set({ reviews }))
      .catch((error) => {
        set((state) => ({
          reviews: state.reviews.filter(
            (review) => review.sourceTaskId !== sourceTaskId,
          ),
        }))
        reportError(error, 'Não foi possível agendar as revisões')
      })
  },
  createManualReviews: (subjectId, count, durationMinutes) => {
    if (count <= 0) return
    const sourceTaskId = `manual-${crypto.randomUUID()}`
    const newReviews = buildReviews(
      subjectId,
      sourceTaskId,
      count,
      durationMinutes,
    )

    set((state) => ({ reviews: [...state.reviews, ...newReviews] }))

    reviewsApi
      .createBatch(newReviews)
      .then((reviews) => set({ reviews }))
      .catch((error) => {
        set((state) => ({
          reviews: state.reviews.filter(
            (review) => review.sourceTaskId !== sourceTaskId,
          ),
        }))
        reportError(error, 'Não foi possível criar as revisões')
      })
  },
  toggleReviewCompleted: (id) => {
    const review = get().reviews.find((item) => item.id === id)
    if (!review) return
    const nextCompleted = !review.completed

    if (nextCompleted) {
      useGamificationStore.getState().awardReviewXP(id)
    }

    set((state) => ({
      reviews: state.reviews.map((item) =>
        item.id === id ? { ...item, completed: nextCompleted } : item,
      ),
    }))

    reviewsApi
      .update(id, { completed: nextCompleted })
      .catch((error) => {
        set((state) => ({
          reviews: state.reviews.map((item) =>
            item.id === id ? { ...item, completed: review.completed } : item,
          ),
        }))
        reportError(error, 'Não foi possível salvar a revisão')
      })
  },
  // Persisted server-side (not just in-memory) so a due/overdue review
  // doesn't re-fire its browser notification on every reload.
  markNotified: (id) => {
    set((state) => ({
      reviews: state.reviews.map((item) =>
        item.id === id ? { ...item, notified: true } : item,
      ),
    }))

    reviewsApi.update(id, { notified: true }).catch(() => {
      // Non-critical: worst case the review gets notified again later.
    })
  },
}))
