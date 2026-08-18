import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { FlashcardFormDialog } from './flashcard-form-dialog'
import { useFlashcardsStore } from '@/stores/flashcards-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useNotesStore } from '@/stores/notes-store'
import type { Flashcard } from '@/types/flashcard'

interface FlashcardsPanelProps {
  subjectFilter: string | null
}

export function FlashcardsPanel({ subjectFilter }: FlashcardsPanelProps) {
  const flashcards = useFlashcardsStore((state) => state.flashcards)
  const removeFlashcard = useFlashcardsStore((state) => state.removeFlashcard)
  const subjects = useSubjectsStore((state) => state.subjects)
  const notes = useNotesStore((state) => state.notes)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)

  const visibleFlashcards = subjectFilter
    ? flashcards.filter((card) => card.subjectId === subjectFilter)
    : flashcards

  function openCreateDialog() {
    setEditingFlashcard(null)
    setDialogOpen(true)
  }

  function openEditDialog(card: Flashcard) {
    setEditingFlashcard(card)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await removeFlashcard(id)
      toast.success('Flashcard removido')
    } catch {
      // store already surfaced a toast.error
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Novo flashcard
        </Button>
      </div>

      {visibleFlashcards.length === 0 ? (
        <Card className="flex min-h-40 items-center justify-center border border-dashed border-border p-6">
          <EmptyState
            icon="🗂️"
            title="Nenhum flashcard ainda"
            description="Crie flashcards para revisar conceitos com repetição espaçada."
            action={
              <Button type="button" size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Criar primeiro flashcard
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFlashcards.map((card) => {
            const subject = card.subjectId
              ? subjects.find((item) => item.id === card.subjectId)
              : undefined
            const note = card.noteId
              ? notes.find((item) => item.id === card.noteId)
              : undefined

            return (
              <Card key={card.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 flex-1 text-sm font-medium text-foreground">
                    {card.front}
                  </p>
                  {subject && (
                    <SubjectColorBadge
                      name={subject.name}
                      color={subject.color}
                      imageUrl={subject.imageUrl}
                      size={24}
                    />
                  )}
                </div>

                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {note && (
                  <p className="truncate text-xs text-muted-foreground">
                    📄 {note.title}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-end gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar flashcard"
                    onClick={() => openEditDialog(card)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remover flashcard"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => void handleDelete(card.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <FlashcardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        flashcard={editingFlashcard}
      />
    </div>
  )
}
