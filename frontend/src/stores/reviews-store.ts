import { create } from 'zustand'
import { toast } from 'sonner'
import { REVIEW_INTERVALS } from '@/types/review'
import type { Review } from '@/types/review'
import { addDays, toISODate } from '@/utils/date'
import { useGamificationStore } from './gamification-store'
import { reviewsApi } from '@/services/reviews-api'
import { ApiError } from '@/services/api-client'

interface ReviewsState {
  reviews: Review[]
  hydrate: (reviews: Review[]) => void
  scheduleReviewsForTask: (subjectId: string, sourceTaskId: string) => void
  toggleReviewCompleted: (id: string) => void
  markNotified: (id: string) => void
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

export const useReviewsStore = create<ReviewsState>()((set, get) => ({
  reviews: [],
  hydrate: (reviews) => set({ reviews }),
  scheduleReviewsForTask: (subjectId, sourceTaskId) => {
    const alreadyScheduled = get().reviews.some(
      (review) => review.sourceTaskId === sourceTaskId,
    )
    if (alreadyScheduled) return

    const today = new Date()
    const newReviews: Review[] = REVIEW_INTERVALS.map((intervalDays) => ({
      id: crypto.randomUUID(),
      subjectId,
      sourceTaskId,
      intervalDays,
      dueDate: toISODate(addDays(today, intervalDays)),
      completed: false,
      notified: false,
    }))

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
