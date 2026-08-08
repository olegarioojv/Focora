import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { cn } from '@/lib/utils'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useCompleteTask } from '@/hooks/use-complete-task'
import { WEEKDAYS } from '@/types/plan'
import { WEEKDAY_LABELS } from '@/utils/weekday-labels'
import { formatShortDate, getCurrentWeekDates, getTodayWeekday } from '@/utils/date'

interface ScheduleModalProps {
  trigger: ReactNode
}

export function ScheduleModal({ trigger }: ScheduleModalProps) {
  const schedule = usePlanStore((state) => state.schedule)
  const subjects = useSubjectsStore((state) => state.subjects)
  const { completeTask } = useCompleteTask()
  const today = getTodayWeekday()
  const weekDates = getCurrentWeekDates()

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="scrollbar-thin max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cronograma da Semana</DialogTitle>
        </DialogHeader>

        {!schedule ? (
          <p className="text-sm text-muted-foreground">
            Gere seu cronograma no Plano Inteligente para vê-lo aqui.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {WEEKDAYS.map((day) => {
              const tasks = schedule[day]
              const isToday = day === today
              return (
                <div
                  key={day}
                  className={cn(
                    'rounded-lg border p-3',
                    isToday ? 'border-primary/40 bg-primary/5' : 'border-border',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">
                        {WEEKDAY_LABELS[day]}
                      </p>
                      {isToday && (
                        <Badge className="h-4 px-1.5 py-0 text-[10px]">
                          Hoje
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(weekDates[day])}
                    </p>
                  </div>

                  {tasks.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sem estudos
                    </p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {tasks.map((task) => {
                        const subject = subjects.find(
                          (item) => item.id === task.subjectId,
                        )
                        if (!subject) return null
                        return (
                          <li key={task.id} className="flex items-center gap-2">
                            <SubjectColorBadge
                              name={subject.name}
                              color={subject.color}
                              imageUrl={subject.imageUrl}
                              size={20}
                            />
                            <span
                              className={cn(
                                'flex-1 truncate text-xs text-foreground',
                                task.completed &&
                                  'text-muted-foreground line-through',
                              )}
                            >
                              {subject.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {task.durationMinutes} min
                            </span>
                            <button
                              type="button"
                              onClick={() => completeTask(day, task.id)}
                              aria-label={
                                task.completed
                                  ? 'Marcar como pendente'
                                  : 'Concluir tarefa'
                              }
                              className={cn(
                                'h-3.5 w-3.5 shrink-0 rounded-full border-2',
                                task.completed
                                  ? 'border-success bg-success'
                                  : 'border-muted-foreground',
                              )}
                            />
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <Link
          to="/app/schedule"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Abrir cronograma completo (arrastar e soltar)
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </DialogContent>
    </Dialog>
  )
}
