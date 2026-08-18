import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Star, Archive, Trash2, X } from 'lucide-react'
import type { Note } from '@/types/note'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useNotesStore } from '@/stores/notes-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useFlashcardsStore } from '@/stores/flashcards-store'
import { NoteMarkdownView } from './note-markdown-view'

interface NoteEditorProps {
  note: Note | null
  onNavigate: (noteId: string) => void
}

const AUTOSAVE_DELAY = 800

export function NoteEditor({ note, onNavigate }: NoteEditorProps) {
  const updateNote = useNotesStore((state) => state.updateNote)
  const removeNote = useNotesStore((state) => state.removeNote)
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite)
  const toggleArchived = useNotesStore((state) => state.toggleArchived)
  const subjects = useSubjectsStore((state) => state.subjects)

  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [selection, setSelection] = useState('')

  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setTags(note?.tags ?? [])
    setTagInput('')
    setSelection('')
  }, [note?.id])

  useEffect(() => {
    return () => {
      if (titleTimer.current) clearTimeout(titleTimer.current)
      if (contentTimer.current) clearTimeout(contentTimer.current)
    }
  }, [])

  if (!note) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border">
        <EmptyState
          icon="📝"
          title="Selecione ou crie uma nota"
          description="Escolha uma nota na lista ao lado ou crie uma nova para começar a escrever."
        />
      </div>
    )
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (titleTimer.current) clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(() => {
      if (note) void updateNote(note.id, { title: value })
    }, AUTOSAVE_DELAY)
  }

  function handleContentChange(value: string) {
    setContent(value)
    if (contentTimer.current) clearTimeout(contentTimer.current)
    contentTimer.current = setTimeout(() => {
      if (note) void updateNote(note.id, { content: value })
    }, AUTOSAVE_DELAY)
  }

  function commitTags(nextTags: string[]) {
    setTags(nextTags)
    if (note) void updateNote(note.id, { tags: nextTags })
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = tagInput.trim()
      if (value && !tags.includes(value)) {
        commitTags([...tags, value])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      commitTags(tags.slice(0, -1))
    }
  }

  function handleCreateFlashcard() {
    if (!note || !selection) return
    useFlashcardsStore
      .getState()
      .addFlashcard({
        front: selection,
        back: '',
        noteId: note.id,
        subjectId: note.subjectId,
      })
      .then(() => {
        toast.success('Flashcard criado — edite a resposta na aba Flashcards')
        setSelection('')
      })
      .catch(() => {
        // error already surfaced via toast in the store
      })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <Input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Título da nota"
        className="border-none px-0 font-heading text-lg font-medium shadow-none focus-visible:ring-0"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={note.subjectId ?? '__none__'}
          onValueChange={(value) =>
            void updateNote(note.id, {
              subjectId: value === '__none__' ? null : value,
            })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Sem matéria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sem matéria</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void toggleFavorite(note.id)}
          aria-label="Favoritar"
        >
          <Star
            className={cn(
              'h-4 w-4',
              note.isFavorite && 'fill-current text-primary',
            )}
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void toggleArchived(note.id)}
          aria-label="Arquivar"
        >
          <Archive
            className={cn('h-4 w-4', note.isArchived && 'text-primary')}
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void removeNote(note.id)}
          aria-label="Excluir nota"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => commitTags(tags.filter((t) => t !== tag))}
              aria-label={`Remover tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Adicionar tag..."
          className="h-6 w-32 border-none px-1 text-xs shadow-none focus-visible:ring-0"
        />
      </div>

      <Tabs defaultValue="editar">
        <TabsList>
          <TabsTrigger value="editar">Editar</TabsTrigger>
          <TabsTrigger value="visualizar">Visualizar</TabsTrigger>
        </TabsList>

        <TabsContent value="editar">
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onSelect={(e) => {
                const target = e.currentTarget
                setSelection(
                  target.value.substring(
                    target.selectionStart,
                    target.selectionEnd,
                  ),
                )
              }}
              placeholder="Escreva sua nota em markdown... use [[Título]] para linkar outra nota"
              className="min-h-[500px] font-mono text-sm"
            />
            {selection && (
              <Button
                type="button"
                size="sm"
                className="absolute bottom-3 right-3"
                onClick={handleCreateFlashcard}
              >
                Criar Flashcard
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="visualizar">
          <NoteMarkdownView content={content} onNavigate={onNavigate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
