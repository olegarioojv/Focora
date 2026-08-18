import { useMemo } from 'react'
import type { Note } from '@/types/note'
import { Card } from '@/components/ui/card'
import { useNotesStore } from '@/stores/notes-store'

interface RelatedNotesPanelProps {
  note: Note | null
  onNavigate: (noteId: string) => void
}

function RelatedList({
  title,
  items,
  onNavigate,
}: {
  title: string
  items: Note[]
  onNavigate: (noteId: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className="truncate rounded-md px-2 py-1 text-left text-sm text-foreground transition-colors hover:bg-accent"
          >
            {item.title || 'Sem título'}
          </button>
        ))}
      </div>
    </div>
  )
}

export function RelatedNotesPanel({ note, onNavigate }: RelatedNotesPanelProps) {
  const notes = useNotesStore((state) => state.notes)

  const sections = useMemo(() => {
    if (!note) return null

    const byId = new Map(notes.map((n) => [n.id, n]))
    const shown = new Set<string>([note.id])

    const sameSubject = note.subjectId
      ? notes.filter(
          (n) =>
            n.id !== note.id &&
            !n.isArchived &&
            n.subjectId === note.subjectId,
        )
      : []
    sameSubject.forEach((n) => shown.add(n.id))

    const tagSet = new Set(note.tags)
    const sharedTags = notes.filter(
      (n) =>
        !shown.has(n.id) &&
        !n.isArchived &&
        n.tags.some((tag) => tagSet.has(tag)),
    )
    sharedTags.forEach((n) => shown.add(n.id))

    const outbound = note.outboundLinks
      .map((id) => byId.get(id))
      .filter((n): n is Note => Boolean(n))
    const inbound = note.inboundLinks
      .map((id) => byId.get(id))
      .filter((n): n is Note => Boolean(n))

    return { sameSubject, sharedTags, outbound, inbound }
  }, [note, notes])

  if (!note || !sections) {
    return (
      <Card className="border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Selecione uma nota para ver as relacionadas.
        </p>
      </Card>
    )
  }

  const hasAny =
    sections.sameSubject.length > 0 ||
    sections.sharedTags.length > 0 ||
    sections.outbound.length > 0 ||
    sections.inbound.length > 0

  return (
    <Card className="border border-border p-4">
      <div className="flex flex-col gap-4">
        {!hasAny && (
          <p className="text-sm text-muted-foreground">
            Nenhuma nota relacionada ainda.
          </p>
        )}
        <RelatedList
          title="Mesma matéria"
          items={sections.sameSubject}
          onNavigate={onNavigate}
        />
        <RelatedList
          title="Tags em comum"
          items={sections.sharedTags}
          onNavigate={onNavigate}
        />
        <RelatedList
          title="Esta nota linka para"
          items={sections.outbound}
          onNavigate={onNavigate}
        />
        <RelatedList
          title="Notas que linkam para esta"
          items={sections.inbound}
          onNavigate={onNavigate}
        />
      </div>
    </Card>
  )
}
