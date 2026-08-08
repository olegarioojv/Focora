import { Check, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { generateChallengeCalendar } from '@/utils/generate-challenge-calendar'
import { useGamificationStore } from '@/stores/gamification-store'
import { useDailyLogsStore } from '@/stores/daily-logs-store'
import type { CalendarDayStatus } from '@/types/dashboard'

const TOTAL_DAYS = 100

const STATUS_STYLES: Record<CalendarDayStatus, string> = {
  completed: 'border-success text-success',
  missed: 'border-destructive text-destructive',
  today: 'border-primary bg-primary text-primary-foreground',
  future: 'border-border text-muted-foreground',
}

const LEGEND: { status: CalendarDayStatus; label: string; dot: string }[] = [
  { status: 'completed', label: 'Concluído', dot: 'bg-success' },
  { status: 'missed', label: 'Perdido', dot: 'bg-destructive' },
  { status: 'today', label: 'Hoje', dot: 'bg-primary' },
  { status: 'future', label: 'Futuro', dot: 'bg-border' },
]

export function DaysCalendar() {
  const challengeStartDate = useGamificationStore(
    (state) => state.challengeStartDate,
  )
  const dailyLogs = useDailyLogsStore((state) => state.dailyLogs)
  const activeDates = new Set(
    dailyLogs.filter((log) => log.minutes > 0).map((log) => log.date),
  )
  const days = generateChallengeCalendar(
    TOTAL_DAYS,
    challengeStartDate,
    activeDates,
  )

  return (
    <Card className="border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-base font-medium">
          Calendário de Dias
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {LEGEND.map((item) => (
            <span key={item.status} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', item.dot)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {days.map(({ day, status }) => (
          <span
            key={day}
            className={cn(
              'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
              STATUS_STYLES[status],
            )}
          >
            {day}
            {status === 'completed' && (
              <span className="absolute -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-success text-card">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
            {status === 'missed' && (
              <span className="absolute -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-destructive text-card">
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
          </span>
        ))}
      </div>
    </Card>
  )
}
