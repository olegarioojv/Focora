import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Archive,
  ChevronRight,
  FileText,
  Folder,
  Plus,
  Star,
  StickyNote,
} from 'lucide-react'
import type { Note } from '@/types/note'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { useNotesStore } from '@/stores/notes-store'
import { useSubjectsStore } from '@/stores/subjects-store'

interface NotesListPanelProps {
  selectedNoteId: string | null
  onSelect: (id: string) => void
  subjectFilter: string | null
  onSubjectFilterChange: (subjectId: string | null) => void
  onNewNote: () => void
}

const ALL_ID = '__all__'
const FAVORITES_ID = '__favoritas__'
const ARCHIVED_ID = '__arquivadas__'

export function NotesListPanel({
  selectedNoteId,
  onSelect,
  subjectFilter,
  onSubjectFilterChange,
  onNewNote,
}: NotesListPanelProps) {
  const notes = useNotesStore((state) => state.notes)
  const subjects = useSubjectsStore((state) => state.subjects)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([ALL_ID]))

  function toggleFolder(id: string, subjectId: string | null) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    onSubjectFilterChange(subjectId)
  }

  const activeNotes = notes.filter((n) => !n.isArchived)
  const favoriteNotes = activeNotes.filter((n) => n.isFavorite)
  const archivedNotes = notes.filter((n) => n.isArchived)

  const searching = query.trim().length > 0
  const searchResults = useMemo(() => {
    if (!searching) return []
    const q = query.trim().toLowerCase()
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
  }, [notes, query, searching])

  function sortByUpdated(items: Note[]) {
    return [...items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 bg-muted/20 p-4 lg:overflow-y-auto">
      <Button
        type="button"
        className="w-full rounded-full font-medium"
        onClick={onNewNote}
      >
        <Plus className="h-4 w-4" />
        Nova nota
      </Button>

      <Input
        placeholder="Buscar notas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {searching ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resultados
          </p>
          {searchResults.length === 0 ? (
            <EmptyState
              icon={<StickyNote className="h-5 w-5" />}
              title="Nenhuma nota encontrada"
              description="Ajuste a busca ou crie uma nota nova."
            />
          ) : (
            <div className="flex flex-col gap-1">
              {searchResults.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  active={note.id === selectedNoteId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pastas
          </p>

          <Folder_
            id={ALL_ID}
            icon={<Folder className="h-3.5 w-3.5" />}
            label="Todas as notas"
            notes={sortByUpdated(activeNotes)}
            expanded={expanded.has(ALL_ID)}
            active={!subjectFilter}
            selectedNoteId={selectedNoteId}
            onToggle={() => toggleFolder(ALL_ID, null)}
            onSelect={onSelect}
          />

          {subjects.map((subject) => (
            <Folder_
              key={subject.id}
              id={subject.id}
              icon={
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
              }
              label={subject.name}
              notes={sortByUpdated(
                activeNotes.filter((n) => n.subjectId === subject.id),
              )}
              expanded={expanded.has(subject.id)}
              active={subjectFilter === subject.id}
              selectedNoteId={selectedNoteId}
              onToggle={() => toggleFolder(subject.id, subject.id)}
              onSelect={onSelect}
            />
          ))}

          <Folder_
            id={FAVORITES_ID}
            icon={<Star className="h-3.5 w-3.5" />}
            label="Favoritas"
            notes={sortByUpdated(favoriteNotes)}
            expanded={expanded.has(FAVORITES_ID)}
            active={false}
            selectedNoteId={selectedNoteId}
            onToggle={() => toggleFolder(FAVORITES_ID, null)}
            onSelect={onSelect}
          />

          <Folder_
            id={ARCHIVED_ID}
            icon={<Archive className="h-3.5 w-3.5" />}
            label="Arquivadas"
            notes={sortByUpdated(archivedNotes)}
            expanded={expanded.has(ARCHIVED_ID)}
            active={false}
            selectedNoteId={selectedNoteId}
            onToggle={() => toggleFolder(ARCHIVED_ID, null)}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}

function Folder_({
  icon,
  label,
  notes,
  expanded,
  active,
  selectedNoteId,
  onToggle,
  onSelect,
}: {
  id: string
  icon: React.ReactNode
  label: string
  notes: Note[]
  expanded: boolean
  active: boolean
  selectedNoteId: string | null
  onToggle: () => void
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
          active
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-foreground hover:bg-accent',
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-90',
          )}
        />
        {icon}
        <span className="flex-1 truncate">{label}</span>
        <span
          className={cn(
            'shrink-0 text-xs tabular-nums',
            active ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {notes.length}
        </span>
      </button>

      {expanded && (
        <div className="ml-4 flex flex-col gap-1 border-l border-border py-1 pl-2">
          {notes.length === 0 ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">
              Nenhuma nota aqui ainda.
            </p>
          ) : (
            notes.map((note) => (
              <NoteFileRow
                key={note.id}
                note={note}
                active={note.id === selectedNoteId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function NoteFileRow({
  note,
  active,
  onSelect,
}: {
  note: Note
  active: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
      )}
    >
      <FileText
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          active ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      />
      <span className="truncate">{note.title || 'Sem título'}</span>
    </button>
  )
}

function NoteRow({
  note,
  active,
  onSelect,
}: {
  note: Note
  active: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={cn(
        'flex flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
      )}
    >
      <span className="truncate text-sm font-medium">
        {note.title || 'Sem título'}
      </span>
      {note.content && (
        <span
          className={cn(
            'line-clamp-1 text-xs',
            active ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {note.content.slice(0, 60)}
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn(
                active && 'border-primary-foreground/30 text-primary-foreground',
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <span
          className={cn(
            'shrink-0 text-[0.65rem]',
            active ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {formatDistanceToNow(new Date(note.updatedAt), {
            locale: ptBR,
            addSuffix: true,
          })}
        </span>
      </div>
    </button>
  )
}
