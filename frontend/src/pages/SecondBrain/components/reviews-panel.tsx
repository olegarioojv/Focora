import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SubjectColorBadge } from '@/components/subjects/subject-color-badge'
import { ReviewSession } from './review-session'
import { useFlashcardsStore, getDueBuckets } from '@/stores/flashcards-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { todayISODate } from '@/utils/date'
import type { Flashcard } from '@/types/flashcard'

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`)
  const to = new Date(`${toIso}T00:00:00Z`)
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

function relativeLabel(nextReviewDate: string, today: string): string {
  const diff = daysBetween(today, nextReviewDate)
  if (diff === 0) return 'hoje'
  if (diff < 0) {
    const overdueDays = Math.abs(diff)
    return `atrasado há ${overdueDays} dia${overdueDays === 1 ? '' : 's'}`
  }
  return `em ${diff} dia${diff === 1 ? '' : 's'}`
}

export function ReviewsPanel() {
  const flashcards = useFlashcardsStore((state) => state.flashcards)
  const subjects = useSubjectsStore((state) => state.subjects)
  const [sessionOpen, setSessionOpen] = useState(false)

  const today = todayISODate()
  const { overdue, today: dueToday, upcoming } = getDueBuckets(flashcards, today)
  const dueQueue = [...overdue, ...dueToday]

  function renderSection(title: string, items: Flashcard[]) {
    if (items.length === 0) return null
    return (
      <div key={title}>
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
        <div className="flex flex-col gap-2">
          {items.map((card) => {
            const subject = card.subjectId
              ? subjects.find((item) => item.id === card.subjectId)
              : undefined
            return (
              <div
                key={card.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                {subject && (
                  <SubjectColorBadge
                    name={subject.name}
                    color={subject.color}
                    imageUrl={subject.imageUrl}
                    size={28}
                  />
                )}
                <p className="line-clamp-1 flex-1 text-sm font-medium text-foreground">
                  {card.front}
                </p>
                <Badge variant="outline">{relativeLabel(card.nextReviewDate, today)}</Badge>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (dueQueue.length === 0 && upcoming.length === 0) {
    return (
      <Card className="flex min-h-40 items-center justify-center border border-dashed border-border p-6">
        <EmptyState
          icon="🗂️"
          title="Nenhum flashcard cadastrado"
          description="Crie flashcards na aba Flashcards para começar a revisar."
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-destructive">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              {overdue.length} atrasada{overdue.length === 1 ? '' : 's'}
            </span>
            <span className="flex items-center gap-1.5 text-warning">
              <span className="h-2 w-2 rounded-full bg-warning" />
              {dueToday.length} para hoje
            </span>
            <span className="flex items-center gap-1.5 text-success">
              <span className="h-2 w-2 rounded-full bg-success" />
              {upcoming.length} futura{upcoming.length === 1 ? '' : 's'}
            </span>
          </div>
          <Button
            type="button"
            disabled={dueQueue.length === 0}
            onClick={() => setSessionOpen(true)}
          >
            Iniciar revisão
          </Button>
        </div>
      </Card>

      {dueQueue.length === 0 && upcoming.length === 0 ? (
        <Card className="flex min-h-32 items-center justify-center border border-dashed border-border p-6">
          <EmptyState icon="🎉" title="Nenhuma revisão pendente" />
        </Card>
      ) : (
        <Card className="border border-border p-6">
          <div className="flex flex-col gap-6">
            {dueQueue.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma revisão pendente por agora 🎉
              </p>
            )}
            {renderSection('Atrasadas', overdue)}
            {renderSection('Hoje', dueToday)}
            {renderSection('Próximas', upcoming)}
          </div>
        </Card>
      )}

      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisão</DialogTitle>
          </DialogHeader>
          <ReviewSession queue={dueQueue} onComplete={() => setSessionOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
