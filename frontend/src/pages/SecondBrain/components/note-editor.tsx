import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Star,
  Archive,
  Trash2,
  X,
  Check,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Link2,
  Code,
  Table as TableIcon,
} from 'lucide-react'
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
const HEADING_LEVELS = [
  { value: '0', label: 'Texto' },
  { value: '1', label: 'Título 1' },
  { value: '2', label: 'Título 2' },
  { value: '3', label: 'Título 3' },
]

type SaveState = 'saved' | 'pending' | 'saving'

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
  const [mode, setMode] = useState<'editar' | 'visualizar'>('editar')
  const [saveState, setSaveState] = useState<SaveState>('saved')

  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setTags(note?.tags ?? [])
    setTagInput('')
    setSelection('')
    setMode('editar')
    setSaveState('saved')
  }, [note?.id])

  useEffect(() => {
    return () => {
      if (titleTimer.current) clearTimeout(titleTimer.current)
      if (contentTimer.current) clearTimeout(contentTimer.current)
    }
  }, [])

  if (!note) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <EmptyState
          icon="📝"
          title="Selecione ou crie uma nota"
          description="Escolha uma nota na lista ao lado ou crie uma nova para começar a escrever."
        />
      </div>
    )
  }

  const subject = note.subjectId
    ? subjects.find((s) => s.id === note.subjectId)
    : undefined

  async function persist(patch: Partial<Note>) {
    if (!note) return
    setSaveState('saving')
    try {
      await updateNote(note.id, patch)
      setSaveState('saved')
    } catch {
      setSaveState('saved')
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    setSaveState('pending')
    if (titleTimer.current) clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(() => void persist({ title: value }), AUTOSAVE_DELAY)
  }

  function handleContentChange(value: string) {
    setContent(value)
    setSaveState('pending')
    if (contentTimer.current) clearTimeout(contentTimer.current)
    contentTimer.current = setTimeout(() => void persist({ content: value }), AUTOSAVE_DELAY)
  }

  function commitTags(nextTags: string[]) {
    setTags(nextTags)
    void persist({ tags: nextTags })
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

  // --- markdown toolbar helpers -------------------------------------

  function focusAndSelect(start: number, end: number) {
    const el = textareaRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start, end)
    })
  }

  function wrapSelection(before: string, after: string = before) {
    const el = textareaRef.current
    if (!el) return
    const value = el.value
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    handleContentChange(next)
    // No selection: drop the cursor between the marks so the user types
    // straight into them, instead of splicing a placeholder word into
    // whatever the cursor happened to be touching (that silently corrupted
    // real content the first time this shipped).
    if (selected) {
      focusAndSelect(start + before.length, start + before.length + selected.length)
    } else {
      focusAndSelect(start + before.length, start + before.length)
    }
  }

  function prefixLines(prefix: string) {
    const el = textareaRef.current
    if (!el) return
    const value = el.value
    const start = el.selectionStart
    const end = el.selectionEnd
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end)
    const block = value.slice(lineStart, lineEnd)
    const nextBlock = block
      .split('\n')
      .map((line) => prefix + line)
      .join('\n')
    const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd)
    handleContentChange(next)
    focusAndSelect(lineStart, lineStart + nextBlock.length)
  }

  function applyHeading(level: string) {
    const el = textareaRef.current
    if (!el) return
    const value = el.value
    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', start) === -1 ? value.length : value.indexOf('\n', start)
    const line = value.slice(lineStart, lineEnd).replace(/^#{1,6}\s/, '')
    const marker = level === '0' ? '' : `${'#'.repeat(Number(level))} `
    const newLine = marker + line
    const next = value.slice(0, lineStart) + newLine + value.slice(lineEnd)
    handleContentChange(next)
    focusAndSelect(lineStart + newLine.length, lineStart + newLine.length)
  }

  function insertAtCursor(text: string) {
    const el = textareaRef.current
    if (!el) return
    const value = el.value
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = value.slice(0, start) + text + value.slice(end)
    handleContentChange(next)
    focusAndSelect(start + text.length, start + text.length)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6 lg:overflow-y-auto">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {subject ? subject.name : 'Sem matéria'}
            <span className="mx-1.5 text-border">/</span>
            <span className="text-foreground">{title || 'Sem título'}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {saveState === 'saved' ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                Salvo
              </>
            ) : (
              'Salvando...'
            )}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Título da nota"
            className="h-auto border-none px-0 font-heading text-2xl font-semibold shadow-none focus-visible:ring-0"
          />

          <div className="flex shrink-0 items-center gap-0.5 pt-1">
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
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Select
            value={note.subjectId ?? '__none__'}
            onValueChange={(value) =>
              void persist({ subjectId: value === '__none__' ? null : value })
            }
          >
            <SelectTrigger size="sm" className="h-7 border-none bg-muted px-2 shadow-none">
              <SelectValue placeholder="Sem matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sem matéria</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {tags.map((tag) => (
            <Badge
              key={tag}
              className="gap-1 rounded-full border-none bg-primary/10 text-primary hover:bg-primary/15"
            >
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
            placeholder="+ tag"
            className="h-7 w-20 border-none bg-transparent px-1.5 text-xs shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="gap-3">
        <TabsList>
          <TabsTrigger value="editar">Editar</TabsTrigger>
          <TabsTrigger value="visualizar">Visualizar</TabsTrigger>
        </TabsList>

        {mode === 'editar' && (
          <div className="flex flex-nowrap items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1.5">
            <Select value="0" onValueChange={applyHeading}>
              <SelectTrigger
                size="sm"
                className="h-8 w-[104px] shrink-0 border-none bg-transparent px-2 text-sm shadow-none"
              >
                <SelectValue placeholder="Título" />
              </SelectTrigger>
              <SelectContent>
                {HEADING_LEVELS.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToolbarDivider />
            <ToolbarButton label="Negrito" onClick={() => wrapSelection('**')}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Itálico" onClick={() => wrapSelection('*')}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Tachado" onClick={() => wrapSelection('~~')}>
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton label="Lista" onClick={() => prefixLines('- ')}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Lista numerada" onClick={() => prefixLines('1. ')}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Checklist" onClick={() => prefixLines('- [ ] ')}>
              <ListChecks className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Citação" onClick={() => prefixLines('> ')}>
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton label="Link" onClick={() => wrapSelection('[', '](url)')}>
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Código" onClick={() => wrapSelection('`')}>
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Tabela"
              onClick={() =>
                insertAtCursor(
                  '\n| Coluna 1 | Coluna 2 |\n| --- | --- |\n| Célula | Célula |\n',
                )
              }
            >
              <TableIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>
        )}

        <TabsContent value="editar">
          <div className="relative">
            <Textarea
              ref={textareaRef}
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
              className="min-h-[500px] resize-none border-none px-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
            />
            {selection && (
              <Button
                type="button"
                size="sm"
                className="absolute bottom-3 right-0"
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

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" />
}
