import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFlashcardsStore } from '@/stores/flashcards-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useNotesStore } from '@/stores/notes-store'
import type { Flashcard } from '@/types/flashcard'

interface FlashcardFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flashcard?: Flashcard | null
}

const NONE_VALUE = '__none__'

export function FlashcardFormDialog({
  open,
  onOpenChange,
  flashcard,
}: FlashcardFormDialogProps) {
  const addFlashcard = useFlashcardsStore((state) => state.addFlashcard)
  const updateFlashcard = useFlashcardsStore((state) => state.updateFlashcard)
  const subjects = useSubjectsStore((state) => state.subjects)
  const notes = useNotesStore((state) => state.notes)

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [noteId, setNoteId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setFront(flashcard?.front ?? '')
    setBack(flashcard?.back ?? '')
    setSubjectId(flashcard?.subjectId ?? null)
    setNoteId(flashcard?.noteId ?? null)
    setTags(flashcard?.tags ?? [])
    setTagInput('')
  }, [open, flashcard])

  function addTagFromInput() {
    const value = tagInput.trim()
    if (!value) return
    if (!tags.includes(value)) {
      setTags((prev) => [...prev, value])
    }
    setTagInput('')
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTagFromInput()
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((item) => item !== tag))
  }

  const isValid = front.trim().length > 0 && back.trim().length > 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isValid || submitting) return

    setSubmitting(true)
    const payload = {
      front: front.trim(),
      back: back.trim(),
      subjectId,
      noteId,
      tags,
    }

    try {
      if (flashcard) {
        await updateFlashcard(flashcard.id, payload)
        toast.success('Flashcard atualizado')
      } else {
        await addFlashcard(payload)
        toast.success('Flashcard criado')
      }
      onOpenChange(false)
    } catch {
      // store already surfaced a toast.error; keep dialog open so the
      // user doesn't lose what they typed
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {flashcard ? 'Editar flashcard' : 'Novo flashcard'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="flashcard-front">
              Frente
            </label>
            <Textarea
              id="flashcard-front"
              placeholder="Pergunta ou conceito"
              value={front}
              onChange={(event) => setFront(event.target.value)}
            />
            {!front.trim() && (
              <p className="text-xs text-muted-foreground">
                A frente do cartão é obrigatória.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="flashcard-back">
              Verso
            </label>
            <Textarea
              id="flashcard-back"
              placeholder="Resposta ou explicação"
              value={back}
              onChange={(event) => setBack(event.target.value)}
            />
            {!back.trim() && (
              <p className="text-xs text-muted-foreground">
                O verso do cartão é obrigatório.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Matéria</span>
            <Select
              value={subjectId ?? NONE_VALUE}
              onValueChange={(value) =>
                setSubjectId(value === NONE_VALUE ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Sem matéria</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Nota vinculada</span>
            <Select
              value={noteId ?? NONE_VALUE}
              onValueChange={(value) =>
                setNoteId(value === NONE_VALUE ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem nota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Sem nota</SelectItem>
                {notes.map((note) => (
                  <SelectItem key={note.id} value={note.id}>
                    {note.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="flashcard-tags">
              Tags
            </label>
            <Input
              id="flashcard-tags"
              placeholder="Digite e pressione Enter"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTagFromInput}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remover tag ${tag}`}
                      onClick={() => removeTag(tag)}
                      className="ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!isValid || submitting}>
              {flashcard ? 'Salvar' : 'Criar flashcard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
