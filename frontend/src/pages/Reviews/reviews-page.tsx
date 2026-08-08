import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { ReviewRow } from './components/review-row'
import { useReviewsStore } from '@/stores/reviews-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { useReviewNotifications } from '@/hooks/use-review-notifications'
import {
  isNotificationSupported,
  requestNotificationPermission,
} from '@/utils/notifications'
import { todayISODate } from '@/utils/date'
import type { Review } from '@/types/review'

export function ReviewsPage() {
  const reviews = useReviewsStore((state) => state.reviews)
  const toggleReviewCompleted = useReviewsStore(
    (state) => state.toggleReviewCompleted,
  )
  const subjects = useSubjectsStore((state) => state.subjects)

  const [permission, setPermission] = useState<NotificationPermission>(
    isNotificationSupported() ? Notification.permission : 'denied',
  )

  useReviewNotifications(permission === 'granted')

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') {
      toast.success('Notificações ativadas')
    } else if (result === 'denied') {
      toast.error('Permissão de notificações negada')
    }
  }

  const today = todayISODate()
  const pending = reviews.filter((review) => !review.completed)
  const overdue = pending.filter((review) => review.dueDate < today)
  const dueToday = pending.filter((review) => review.dueDate === today)
  const upcoming = pending
    .filter((review) => review.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  function renderSection(title: string, items: Review[]) {
    if (items.length === 0) return null
    return (
      <div key={title}>
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
        <div className="flex flex-col gap-2">
          {items.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              subject={subjects.find(
                (subject) => subject.id === review.subjectId,
              )}
              onToggle={() => toggleReviewCompleted(review.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Revisões</h1>
          <p className="text-sm text-muted-foreground">
            Revisões espaçadas em 1, 3, 7, 15 e 30 dias após concluir uma
            tarefa de estudo no cronograma.
          </p>
        </div>
        {isNotificationSupported() && permission !== 'granted' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleEnableNotifications()}
          >
            <BellRing className="h-4 w-4" />
            Ativar notificações
          </Button>
        )}
      </div>

      {pending.length === 0 ? (
        <Card className="flex min-h-40 items-center justify-center border border-dashed border-border p-6">
          <EmptyState
            icon="✅"
            title="Nenhuma revisão pendente"
            description="Conclua tarefas no Cronograma para gerar revisões automaticamente."
          />
        </Card>
      ) : (
        <Card className="border border-border p-6">
          <div className="flex flex-col gap-6">
            {renderSection('Atrasadas', overdue)}
            {renderSection('Hoje', dueToday)}
            {renderSection('Próximas', upcoming)}
          </div>
        </Card>
      )}
    </div>
  )
}
