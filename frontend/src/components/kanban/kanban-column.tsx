import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AddTaskDialog } from './add-task-dialog'
import { KanbanCard } from './kanban-card'
import type { ScheduleTask, Weekday } from '@/types/plan'
import type { Subject } from '@/types/subject'

interface KanbanColumnProps {
  day: Weekday
  label: string
  date: string
  isToday: boolean
  tasks: ScheduleTask[]
  subjects: Subject[]
  onToggleCompleted: (taskId: string) => void
}

export function KanbanColumn({
  day,
  label,
  date,
  isToday,
  tasks,
  subjects,
  onToggleCompleted,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: `column-${day}` })

  return (
    <Card
      className={cn(
        'min-h-[240px] border p-3',
        isToday ? 'border-primary/40 bg-primary/5' : 'border-border',
      )}
    >
      <div className="flex items-center gap-1.5 px-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {isToday && (
          <Badge className="h-4 px-1.5 py-0 text-[10px]">Hoje</Badge>
        )}
      </div>
      <p className="px-1 text-xs text-muted-foreground">{date}</p>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="mt-3 flex min-h-8 flex-col gap-2">
          {tasks.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground">Sem estudos</p>
          )}
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              subject={subjects.find((subject) => subject.id === task.subjectId)}
              onToggleCompleted={() => onToggleCompleted(task.id)}
            />
          ))}
        </div>
      </SortableContext>

      <AddTaskDialog day={day} />
    </Card>
  )
}
