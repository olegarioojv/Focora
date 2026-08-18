import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, StickyNote } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
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

interface NotesListPanelProps {
  selectedNoteId: string | null
  onSelect: (id: string) => void
  subjectFilter: string | null
  onSubjectFilterChange: (subjectId: string | null) => void
  onNewNote: () => void
}

type StatusFilter = 'todas' | 'favoritas' | 'arquivadas'

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
  const [status, setStatus] = useState<StatusFilter>('todas')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes
      .filter((note) => {
        if (status === 'favoritas') return note.isFavorite && !note.isArchived
        if (status === 'arquivadas') return note.isArchived
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
  }, [notes, query, status, subjectFilter])

  return (
    <Card className="border border-border p-4">
      <div className="flex flex-col gap-3">
        <Button type="button" className="w-full" onClick={onNewNote}>
          <Plus className="h-4 w-4" />
          Nova nota
        </Button>

        <Input
          placeholder="Buscar notas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Select
          value={subjectFilter ?? '__all__'}
          onValueChange={(value) =>
            onSubjectFilterChange(value === '__all__' ? null : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas as matérias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as matérias</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {(
            [
              { value: 'todas', label: 'Todas' },
              { value: 'favoritas', label: 'Favoritas' },
              { value: 'arquivadas', label: 'Arquivadas' },
            ] as { value: StatusFilter; label: string }[]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={cn(
                'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                status === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<StickyNote className="h-5 w-5" />}
            title="Nenhuma nota encontrada"
            description="Crie uma nota nova ou ajuste os filtros."
          />
        ) : (
          <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
            {filtered.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => onSelect(note.id)}
                className={cn(
                  'flex flex-col gap-1 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:bg-accent',
                  note.id === selectedNoteId && 'bg-accent border-border',
                )}
              >
                <span className="truncate text-sm font-medium text-foreground">
                  {note.title || 'Sem título'}
                </span>
                {note.content && (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {note.content.slice(0, 60)}
                  </span>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="shrink-0 text-[0.65rem] text-muted-foreground">
                    {formatDistanceToNow(new Date(note.updatedAt), {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
