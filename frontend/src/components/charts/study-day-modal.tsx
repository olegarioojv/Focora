import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { dayPlanApi, type DailySessionEntry } from '@/services/day-plan-api'
import { formatFullDate, formatTime } from '@/utils/date'

interface StudyDayModalProps {
  date: string | null
  onOpenChange: (open: boolean) => void
}

export function StudyDayModal({ date, onOpenChange }: StudyDayModalProps) {
  const [sessions, setSessions] = useState<DailySessionEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!date) return

    let cancelled = false
    setLoading(true)
    setSessions([])

    dayPlanApi
      .listSessionsByDate(date)
      .then((data) => {
        if (!cancelled) setSessions(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [date])

  return (
    <Dialog open={date !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{date ? formatFullDate(date) : ''}</DialogTitle>
          <DialogDescription>Matérias estudadas nesse dia</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma sessão concluída nesse dia.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{session.subjectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.category} · {session.durationMinutes} min
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatTime(session.completedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
