import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Note } from '@/types/note'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { cn } from '@/lib/utils'
import { useNotesStore } from '@/stores/notes-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useProfileStore } from '@/stores/profile-store'

const WORDS_PER_MINUTE = 200

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right text-foreground">{children}</span>
    </div>
  )
}

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
  const subjects = useSubjectsStore((state) => state.subjects)
  const profileName = useProfileStore((state) => state.name)

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
      <div className="bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">
          Selecione uma nota para ver as relacionadas.
        </p>
      </div>
    )
  }

  const hasAny =
    sections.sameSubject.length > 0 ||
    sections.sharedTags.length > 0 ||
    sections.outbound.length > 0 ||
    sections.inbound.length > 0

  const subject = note.subjectId
    ? subjects.find((s) => s.id === note.subjectId)
    : undefined
  const wordCount = note.content.trim()
    ? note.content.trim().split(/\s+/).length
    : 0
  const readingMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
  const authorInitial = (profileName || 'Você').charAt(0).toUpperCase()

  return (
    <div className="bg-muted/20 p-4">
      <div className="mb-5 flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Informações
        </p>
        <InfoRow label="Criada em">
          {format(new Date(note.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </InfoRow>
        <InfoRow label="Atualizada em">
          {format(new Date(note.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </InfoRow>
        <InfoRow label="Autor">
          <span className="flex items-center justify-end gap-1.5">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/15 text-primary">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            {profileName || 'Você'}
          </span>
        </InfoRow>
        <InfoRow label="Localização">
          {subject ? (
            <span className="flex items-center justify-end gap-1.5">
              <SubjectColorBadge
                name={subject.name}
                color={subject.color}
                imageUrl={subject.imageUrl}
                size={16}
              />
              {subject.name}
            </span>
          ) : (
            'Sem matéria'
          )}
        </InfoRow>
        <InfoRow label="Status">
          <Badge
            className={cn(
              'rounded-full border-none',
              note.isArchived
                ? 'bg-muted text-muted-foreground'
                : 'bg-success/15 text-success',
            )}
          >
            {note.isArchived ? 'Arquivada' : 'Ativa'}
          </Badge>
        </InfoRow>
        <InfoRow label="Palavras">{wordCount}</InfoRow>
        <InfoRow label="Tempo de leitura">{readingMinutes} min</InfoRow>
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Relacionadas
      </p>
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
    </div>
  )
}
