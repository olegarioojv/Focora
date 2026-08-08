import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Card } from '@/components/ui/card'
import { KanbanColumn } from '@/components/kanban/kanban-column'
import { KanbanCard } from '@/components/kanban/kanban-card'
import { TrashDropZone, TRASH_DROPPABLE_ID } from '@/components/kanban/trash-drop-zone'
import { IntelligentPlanModal } from './intelligent-plan-modal'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useCompleteTask } from '@/hooks/use-complete-task'
import { useVisibleDayCount } from '@/hooks/use-visible-day-count'
import { WEEKDAYS } from '@/types/plan'
import type { Weekday, WeeklySchedule } from '@/types/plan'
import { WEEKDAY_LABELS } from '@/utils/weekday-labels'
import {
  formatShortDate,
  getCurrentWeekDates,
  getTodayWeekday,
} from '@/utils/date'

function findDayContainingTask(
  schedule: WeeklySchedule,
  taskId: string,
): Weekday | null {
  for (const day of WEEKDAYS) {
    if (schedule[day].some((task) => task.id === taskId)) return day
  }
  return null
}

export function WeeklySchedulePreview() {
  const schedule = usePlanStore((state) => state.schedule)
  const moveTask = usePlanStore((state) => state.moveTask)
  const removeTask = usePlanStore((state) => state.removeTask)
  const subjects = useSubjectsStore((state) => state.subjects)
  const { completeTask } = useCompleteTask()
  const today = getTodayWeekday()
  const weekDates = getCurrentWeekDates()
  const todayIndex = WEEKDAYS.indexOf(today)
  const visibleCount = useVisibleDayCount()

  // Starts (and re-centers, if the viewport is resized across a
  // breakpoint) the carousel with today in the middle column.
  const [startIndex, setStartIndex] = useState(
    (todayIndex - Math.floor(visibleCount / 2) + WEEKDAYS.length) %
      WEEKDAYS.length,
  )
  useEffect(() => {
    setStartIndex(
      (todayIndex - Math.floor(visibleCount / 2) + WEEKDAYS.length) %
        WEEKDAYS.length,
    )
  }, [visibleCount, todayIndex])

  const visibleDays = useMemo(
    () =>
      Array.from(
        { length: visibleCount },
        (_, offset) => WEEKDAYS[(startIndex + offset) % WEEKDAYS.length],
      ),
    [startIndex, visibleCount],
  )

  function goToPrevious() {
    setStartIndex((index) => (index - 1 + WEEKDAYS.length) % WEEKDAYS.length)
  }

  function goToNext() {
    setStartIndex((index) => (index + 1) % WEEKDAYS.length)
  }

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTaskId(null)
    if (!over || !schedule) return

    const taskId = active.id as string
    const fromDay = findDayContainingTask(schedule, taskId)
    if (!fromDay) return

    const overId = over.id as string

    if (overId === TRASH_DROPPABLE_ID) {
      removeTask(fromDay, taskId)
      return
    }

    let toDay: Weekday
    let overTaskId: string | null

    if (overId.startsWith('column-')) {
      toDay = overId.replace('column-', '') as Weekday
      overTaskId = null
    } else {
      const day = findDayContainingTask(schedule, overId)
      if (!day) return
      toDay = day
      overTaskId = overId
    }

    if (fromDay === toDay && overTaskId === taskId) return

    moveTask({ taskId, fromDay, toDay, overTaskId })
  }

  const activeTask =
    activeTaskId && schedule
      ? WEEKDAYS.flatMap((day) => schedule[day]).find(
          (task) => task.id === activeTaskId,
        )
      : null
  const activeSubject = activeTask
    ? subjects.find((subject) => subject.id === activeTask.subjectId)
    : undefined

  return (
    <Card className="border border-border p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-medium">
          Cronograma de Estudos
        </h3>
        <IntelligentPlanModal
          trigger={
            <button
              type="button"
              aria-label="Plano Inteligente"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          }
        />
      </div>

      {!schedule ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Gere seu cronograma no Plano Inteligente para vê-lo aqui.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              aria-label="Dias anteriores"
              onClick={goToPrevious}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              className="grid min-w-0 flex-1 gap-3"
              style={{
                gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
              }}
            >
              {visibleDays.map((day) => (
                <KanbanColumn
                  key={day}
                  day={day}
                  label={WEEKDAY_LABELS[day]}
                  date={formatShortDate(weekDates[day])}
                  isToday={day === today}
                  tasks={schedule[day]}
                  subjects={subjects}
                  onToggleCompleted={(taskId) => completeTask(day, taskId)}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Próximos dias"
              onClick={goToNext}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <DragOverlay>
            {activeTask && (
              <KanbanCard
                task={activeTask}
                subject={activeSubject}
                onToggleCompleted={() => {}}
              />
            )}
          </DragOverlay>

          <TrashDropZone visible={activeTaskId !== null} />
        </DndContext>
      )}
    </Card>
  )
}
