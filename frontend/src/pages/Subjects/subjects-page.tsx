import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SubjectFormDialog } from '@/components/subjects/subject-form-dialog'
import { SubjectCard } from '@/components/subjects/subject-card'
import { useSubjectsStore } from '@/stores/subjects-store'

export function SubjectsPage() {
  const subjects = useSubjectsStore((state) => state.subjects)
  const addSubject = useSubjectsStore((state) => state.addSubject)
  const updateSubject = useSubjectsStore((state) => state.updateSubject)
  const removeSubject = useSubjectsStore((state) => state.removeSubject)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Minhas Matérias
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize as matérias do seu desafio de 100 dias.
          </p>
        </div>
        <SubjectFormDialog
          onSubmit={(values) => {
            addSubject(values)
            toast.success('Matéria adicionada')
          }}
          trigger={
            <Button type="button">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          }
        />
      </div>

      {subjects.length === 0 ? (
        <Card className="border border-dashed border-border p-6">
          <EmptyState
            icon="📚"
            title="Nenhuma matéria cadastrada ainda"
            description="Cadastre sua primeira matéria pra começar a organizar os estudos."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onUpdate={(values) => {
                updateSubject(subject.id, values)
                toast.success('Matéria atualizada')
              }}
              onRemove={() => {
                removeSubject(subject.id)
                toast.success('Matéria removida')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
