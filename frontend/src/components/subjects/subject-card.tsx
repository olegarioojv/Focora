import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { SubjectColorBadge } from './subject-color-badge'
import { PriorityStars } from './priority-stars'
import { SubjectFormDialog } from './subject-form-dialog'
import { WEEKDAY_SHORT_LABELS } from '@/utils/weekday-labels'
import type { Subject } from '@/types/subject'
import type { SubjectFormValues } from './subject-form-schema'

interface SubjectCardProps {
  subject: Subject
  onUpdate: (values: SubjectFormValues) => void
  onRemove: () => void
}

export function SubjectCard({ subject, onUpdate, onRemove }: SubjectCardProps) {
  return (
    <Card className="border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SubjectColorBadge
            name={subject.name}
            color={subject.color}
            imageUrl={subject.imageUrl}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {subject.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {subject.goal}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <SubjectFormDialog
            subject={subject}
            onSubmit={onUpdate}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Progress value={subject.progress} className="h-2 flex-1" />
        <span className="text-sm font-medium text-foreground">
          {subject.progress}%
        </span>
      </div>

      <div className="mt-3">
        <PriorityStars value={subject.priority} />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {subject.preferredDays.length === 0
          ? 'Qualquer dia da semana'
          : subject.preferredDays
              .map((day) => WEEKDAY_SHORT_LABELS[day])
              .join(', ')}
      </p>
    </Card>
  )
}
