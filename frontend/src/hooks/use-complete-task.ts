import { usePlanStore } from '@/stores/plan-store'
import { useReviewsStore } from '@/stores/reviews-store'
import { useGamificationStore } from '@/stores/gamification-store'
import type { Weekday } from '@/types/plan'

export function useCompleteTask() {
  const schedule = usePlanStore((state) => state.schedule)
  const toggleTaskCompleted = usePlanStore((state) => state.toggleTaskCompleted)
  const scheduleReviewsForTask = useReviewsStore(
    (state) => state.scheduleReviewsForTask,
  )
  const awardTaskXP = useGamificationStore((state) => state.awardTaskXP)

  function completeTask(day: Weekday, taskId: string) {
    const task = schedule?.[day].find((item) => item.id === taskId)
    const wasCompleted = task?.completed ?? false

    toggleTaskCompleted(day, taskId)

    if (task && !wasCompleted) {
      scheduleReviewsForTask(task.subjectId, task.id)
      awardTaskXP(task.id)
    }
  }

  return { completeTask }
}
