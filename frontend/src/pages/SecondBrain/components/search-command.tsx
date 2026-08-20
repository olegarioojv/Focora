import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { useNotesStore } from '@/stores/notes-store'
import { useFlashcardsStore } from '@/stores/flashcards-store'

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigateToNote: (noteId: string) => void
}

const RESULT_CAP = 8

export function SearchCommand({
  open,
  onOpenChange,
  onNavigateToNote,
}: SearchCommandProps) {
  const notes = useNotesStore((state) => state.notes)
  const flashcards = useFlashcardsStore((state) => state.flashcards)
  const [query, setQuery] = useState('')

  const matchedNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
      .slice(0, RESULT_CAP)
  }, [notes, query])

  const matchedFlashcards = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return flashcards
      .filter(
        (card) =>
          card.front.toLowerCase().includes(q) ||
          card.back.toLowerCase().includes(q) ||
          card.tags.some((tag) => tag.toLowerCase().includes(q)),
      )
      .slice(0, RESULT_CAP)
  }, [flashcards, query])

  const hasQuery = query.trim().length > 0
  const hasResults = matchedNotes.length > 0 || matchedFlashcards.length > 0

  function handleNoteClick(noteId: string) {
    onNavigateToNote(noteId)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setQuery('')
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar</DialogTitle>
        </DialogHeader>

        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar notas e flashcards..."
        />

        {!hasQuery && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Digite para buscar em notas e flashcards.
          </p>
        )}

        {hasQuery && !hasResults && (
          <EmptyState
            icon="🔍"
            title="Nada encontrado"
            description="Tente outro termo de busca."
          />
        )}

        {hasQuery && hasResults && (
          <div className="flex max-h-80 flex-col gap-4 overflow-y-auto">
            {matchedNotes.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notas
                </span>
                {matchedNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleNoteClick(note.id)}
                    className="truncate rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    {note.title || 'Sem título'}
                  </button>
                ))}
              </div>
            )}

            {matchedFlashcards.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Flashcards
                </span>
                {matchedFlashcards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="truncate rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    {card.front}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
