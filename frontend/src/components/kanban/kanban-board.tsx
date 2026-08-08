import { useState } from 'react'
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
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { TrashDropZone, TRASH_DROPPABLE_ID } from './trash-drop-zone'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useCompleteTask } from '@/hooks/use-complete-task'
import { WEEKDAYS } from '@/types/plan'
import type { Weekday, WeeklySchedule } from '@/types/plan'
import { WEEKDAY_LABELS } from '@/utils/weekday-labels'
import { formatShortDate, getCurrentWeekDates, getTodayWeekday } from '@/utils/date'

function findDayContainingTask(
  schedule: WeeklySchedule,
  taskId: string,
): Weekday | null {
  for (const day of WEEKDAYS) {
    if (schedule[day].some((task) => task.id === taskId)) return day
  }
  return null
}

export function KanbanBoard() {
  const schedule = usePlanStore((state) => state.schedule)
  const moveTask = usePlanStore((state) => state.moveTask)
  const removeTask = usePlanStore((state) => state.removeTask)
  const subjects = useSubjectsStore((state) => state.subjects)
  const { completeTask } = useCompleteTask()

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const today = getTodayWeekday()
  const weekDates = getCurrentWeekDates()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  if (!schedule) {
    return (
      <Card className="flex min-h-40 items-center justify-center border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Gere o cronograma no Plano Inteligente para organizar a semana aqui.
      </Card>
    )
  }

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

  const activeTask = activeTaskId
    ? WEEKDAYS.flatMap((day) => schedule[day]).find(
        (task) => task.id === activeTaskId,
      )
    : null
  const activeSubject = activeTask
    ? subjects.find((subject) => subject.id === activeTask.subjectId)
    : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {WEEKDAYS.map((day) => (
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
  )
}
