import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNotesStore } from '@/stores/notes-store'
import { useFlashcardsStore, getDueBuckets } from '@/stores/flashcards-store'
import { todayISODate } from '@/utils/date'

export function SecondBrainCard() {
  const notes = useNotesStore((state) => state.notes)
  const flashcards = useFlashcardsStore((state) => state.flashcards)

  const activeNotes = notes.filter((note) => !note.isArchived)
  const { overdue, today } = getDueBuckets(flashcards, todayISODate())
  const dueCount = overdue.length + today.length

  return (
    <Card className="border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Segundo Cérebro</p>
        <Link
          to="/app/brain"
          className="text-xs font-medium text-primary hover:underline"
        >
          Abrir
        </Link>
      </div>

      <Link
        to="/app/brain"
        className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-border p-3 transition-colors hover:border-primary/40"
      >
        <Brain className="h-8 w-8 shrink-0 text-primary" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-foreground">
            {activeNotes.length}{' '}
            {activeNotes.length === 1 ? 'nota' : 'notas'}
          </span>
          <span className="text-xs text-muted-foreground">
            {dueCount > 0
              ? `${dueCount} ${dueCount === 1 ? 'flashcard' : 'flashcards'} para revisar`
              : 'Nenhuma revisão pendente'}
          </span>
        </div>
      </Link>
    </Card>
  )
}
