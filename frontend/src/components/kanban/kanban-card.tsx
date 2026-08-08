import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ScheduleTask } from '@/types/plan'
import type { Subject } from '@/types/subject'

interface KanbanCardProps {
  task: ScheduleTask
  subject: Subject | undefined
  onToggleCompleted: () => void
}

export function KanbanCard({
  task,
  subject,
  onToggleCompleted,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!subject) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex cursor-grab touch-none flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5 active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <span className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleCompleted()
          }}
          aria-label={
            task.completed ? 'Marcar como não concluída' : 'Concluir tarefa'
          }
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
        <span
          className={cn(
            'truncate text-xs font-medium text-foreground',
            task.completed && 'text-muted-foreground line-through',
          )}
        >
          {subject.name}
        </span>
      </span>
      <span className="flex items-center justify-between gap-1.5">
        <Badge
          variant="outline"
          className={cn(
            'h-4 border-transparent px-1.5 py-0 text-[10px]',
            task.type === 'Revisão'
              ? 'bg-amber-500/15 text-amber-400'
              : 'text-foreground',
          )}
          style={
            task.type === 'Estudos'
              ? { backgroundColor: `${subject.color}26`, color: subject.color }
              : undefined
          }
        >
          {task.type}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {task.durationMinutes} min
        </span>
      </span>
    </div>
  )
}
