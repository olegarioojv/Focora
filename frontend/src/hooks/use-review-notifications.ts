import { useEffect } from 'react'
import { useReviewsStore } from '@/stores/reviews-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { sendNotification } from '@/utils/notifications'
import { todayISODate } from '@/utils/date'

export function useReviewNotifications(enabled: boolean) {
  const reviews = useReviewsStore((state) => state.reviews)
  const markNotified = useReviewsStore((state) => state.markNotified)
  const subjects = useSubjectsStore((state) => state.subjects)

  useEffect(() => {
    if (!enabled) return

    const today = todayISODate()
    const due = reviews.filter(
      (review) =>
        !review.completed && review.dueDate <= today && !review.notified,
    )

    due.forEach((review) => {
      const subject = subjects.find((item) => item.id === review.subjectId)
      sendNotification(
        'Revisão pendente — Focora',
        `${subject?.name ?? 'Matéria'}: revisão de ${review.intervalDays} dia(s) está pronta.`,
      )
      markNotified(review.id)
    })
  }, [enabled, reviews, subjects, markNotified])
}
