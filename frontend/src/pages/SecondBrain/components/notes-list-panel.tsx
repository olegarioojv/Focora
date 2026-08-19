import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Archive, ChevronRight, Folder, Plus, Star, StickyNote } from 'lucide-react'
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

type SpecialFilter = 'todas' | 'favoritas' | 'arquivadas'

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
  const [special, setSpecial] = useState<SpecialFilter>('todas')

  function selectSpecial(value: SpecialFilter) {
    setSpecial(value)
    onSubjectFilterChange(null)
  }

  function selectSubject(subjectId: string) {
    setSpecial('todas')
    onSubjectFilterChange(subjectId)
  }

  const activeNotes = notes.filter((n) => !n.isArchived)
  const favoriteCount = activeNotes.filter((n) => n.isFavorite).length
  const archivedCount = notes.length - activeNotes.length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes
      .filter((note) => {
        if (special === 'favoritas') return note.isFavorite && !note.isArchived
        if (special === 'arquivadas') return note.isArchived
        return !note.isArchived
      })
      .filter((note) => (subjectFilter ? note.subjectId === subjectFilter : true))
      .filter((note) => {
        if (!q) return true
        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q)
        )
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
  }, [notes, query, special, subjectFilter])

  const isAllActive = special === 'todas' && !subjectFilter

  return (
    <div className="bg-muted/20">
      <div className="flex flex-col gap-4 p-4">
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

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pastas
          </p>
          <div className="flex flex-col">
            <FolderRow
              icon={<Folder className="h-3.5 w-3.5" />}
              label="Todas as notas"
              count={activeNotes.length}
              active={isAllActive}
              onClick={() => selectSpecial('todas')}
            />
            {subjects.map((subject) => (
              <FolderRow
                key={subject.id}
                icon={
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                }
                label={subject.name}
                count={
                  activeNotes.filter((n) => n.subjectId === subject.id).length
                }
                active={subjectFilter === subject.id}
                onClick={() => selectSubject(subject.id)}
              />
            ))}
            <FolderRow
              icon={<Star className="h-3.5 w-3.5" />}
              label="Favoritas"
              count={favoriteCount}
              active={special === 'favoritas'}
              onClick={() => selectSpecial('favoritas')}
            />
            <FolderRow
              icon={<Archive className="h-3.5 w-3.5" />}
              label="Arquivadas"
              count={archivedCount}
              active={special === 'arquivadas'}
              onClick={() => selectSpecial('arquivadas')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {special === 'favoritas'
              ? 'Favoritas'
              : special === 'arquivadas'
                ? 'Arquivadas'
                : 'Notas recentes'}
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<StickyNote className="h-5 w-5" />}
              title="Nenhuma nota encontrada"
              description="Crie uma nota nova ou ajuste os filtros."
            />
          ) : (
            <div className="flex max-h-[55vh] flex-col gap-1 overflow-y-auto">
              {filtered.map((note) => {
                const active = note.id === selectedNoteId
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => onSelect(note.id)}
                    className={cn(
                      'flex flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent',
                    )}
                  >
                    <span className="truncate text-sm font-medium">
                      {note.title || 'Sem título'}
                    </span>
                    {note.content && (
                      <span
                        className={cn(
                          'line-clamp-1 text-xs',
                          active
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground',
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
                              active &&
                                'border-primary-foreground/30 text-primary-foreground',
                            )}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-[0.65rem]',
                          active
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FolderRow({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
        active
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-foreground hover:bg-accent',
      )}
    >
      <ChevronRight
        className={cn(
          'h-3 w-3 shrink-0 text-muted-foreground transition-transform',
          active && 'rotate-90',
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
        {count}
      </span>
    </button>
  )
}
