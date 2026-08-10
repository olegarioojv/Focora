import { Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { PriorityStars } from '@/components/subjects/priority-stars'
import { SubjectFormDialog } from '@/components/subjects/subject-form-dialog'
import { getSubjectProgress } from '@/utils/subject-progress'
import { useSubjectsStore } from '@/stores/subjects-store'

export function MySubjectsCard() {
  const subjects = useSubjectsStore((state) => state.subjects)
  const addSubject = useSubjectsStore((state) => state.addSubject)
  const updateSubject = useSubjectsStore((state) => state.updateSubject)

  return (
    <Card className="border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Minhas Matérias</p>
        <SubjectFormDialog
          onSubmit={(values) => {
            addSubject(values)
            toast.success('Matéria adicionada')
          }}
          trigger={
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </button>
          }
        />
      </div>

      <ul className="mt-3 flex flex-col gap-3">
        {subjects.map((subject) => {
          const progress = getSubjectProgress(subject)
          return (
          <li key={subject.id} className="group flex items-center gap-3">
            <SubjectColorBadge
              name={subject.name}
              color={subject.color}
              imageUrl={subject.imageUrl}
              size={28}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-foreground">
                  {subject.name}
                </span>
                {progress !== null && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {progress}%
                  </span>
                )}
              </div>
              {progress !== null && (
                <Progress value={progress} className="mt-1 h-1.5" />
              )}
            </div>
            <PriorityStars value={subject.priority} size={10} />
            <SubjectFormDialog
              subject={subject}
              onSubmit={(values) => {
                updateSubject(subject.id, values)
                toast.success('Matéria atualizada')
              }}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Editar ${subject.name}`}
                  className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
          </li>
          )
        })}
      </ul>
    </Card>
  )
}
