import { Badge } from '@/components/ui/badge'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { cn } from '@/lib/utils'
import { formatFullDate } from '@/utils/date'
import type { Review } from '@/types/review'
import type { Subject } from '@/types/subject'

interface ReviewRowProps {
  review: Review
  subject: Subject | undefined
  onToggle: () => void
}

export function ReviewRow({ review, subject, onToggle }: ReviewRowProps) {
  if (!subject) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          review.completed ? 'Marcar como pendente' : 'Concluir revisão'
        }
        className={cn(
          'h-4 w-4 shrink-0 rounded-full border-2',
          review.completed
            ? 'border-success bg-success'
            : 'border-muted-foreground',
        )}
      />
      <SubjectColorBadge
        name={subject.name}
        color={subject.color}
        imageUrl={subject.imageUrl}
        size={28}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium text-foreground',
            review.completed && 'text-muted-foreground line-through',
          )}
        >
          {subject.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFullDate(review.dueDate)}
        </p>
      </div>
      <Badge variant="outline">{review.intervalDays}d</Badge>
      <Badge variant="outline">{review.durationMinutes}min</Badge>
    </div>
  )
}
