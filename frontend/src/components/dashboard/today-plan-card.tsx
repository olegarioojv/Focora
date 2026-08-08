import { CheckCircle2, Circle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { cn } from '@/lib/utils'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useCompleteTask } from '@/hooks/use-complete-task'
import { getTodayWeekday } from '@/utils/date'
import { ScheduleModal } from './schedule-modal'

export function TodayPlanCard() {
  const schedule = usePlanStore((state) => state.schedule)
  const subjects = useSubjectsStore((state) => state.subjects)
  const { completeTask } = useCompleteTask()

  const today = getTodayWeekday()
  const tasks = schedule?.[today] ?? []

  return (
    <Card className="border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Plano para Hoje</p>
        <ScheduleModal
          trigger={
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver tudo
            </button>
          }
        />
      </div>

      {!schedule || tasks.length === 0 ? (
        <EmptyState
          icon={schedule ? '🎉' : '🗓️'}
          title={schedule ? 'Nenhuma tarefa para hoje' : 'Sem cronograma ainda'}
          description={
            schedule ? undefined : 'Gere seu cronograma no Plano Inteligente.'
          }
        />
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {tasks.map((task) => {
            const subject = subjects.find(
              (item) => item.id === task.subjectId,
            )
            if (!subject) return null
            return (
              <li key={task.id} className="flex items-center gap-2.5">
                <SubjectColorBadge
                  name={subject.name}
                  color={subject.color}
                  imageUrl={subject.imageUrl}
                  size={24}
                />
                <span
                  className={cn(
                    'flex-1 truncate text-sm text-foreground',
                    task.completed && 'text-muted-foreground line-through',
                  )}
                >
                  {subject.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {task.durationMinutes} min
                </span>
                <button
                  type="button"
                  onClick={() => completeTask(today, task.id)}
                  aria-label={
                    task.completed
                      ? 'Marcar como pendente'
                      : 'Concluir tarefa'
                  }
                  className="shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
