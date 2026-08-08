import { CalendarCheck, Clock, Timer } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatsOverviewProps {
  totalHours: number
  totalPomodoros: number
  activeDays: number
}

export function StatsOverview({
  totalHours,
  totalPomodoros,
  activeDays,
}: StatsOverviewProps) {
  const items = [
    { label: 'Horas estudadas', value: `${totalHours}h`, icon: Clock },
    { label: 'Pomodoros concluídos', value: totalPomodoros, icon: Timer },
    { label: 'Dias ativos', value: `${activeDays}/100`, icon: CalendarCheck },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="border border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
