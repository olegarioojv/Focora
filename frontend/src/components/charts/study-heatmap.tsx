import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DailyStat } from '@/utils/daily-logs'
import { StudyDayModal } from './study-day-modal'

function intensityClass(minutes: number) {
  if (minutes === 0) return 'bg-muted'
  if (minutes < 60) return 'bg-primary/25'
  if (minutes < 120) return 'bg-primary/50'
  if (minutes < 180) return 'bg-primary/75'
  return 'bg-primary'
}

interface StudyHeatmapProps {
  data: DailyStat[]
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  // Most recent day first (like a feed) — `data` itself stays oldest-first
  // since other charts (weekly/monthly) rely on that order.
  const reversedData = [...data].reverse()

  return (
    <Card className="border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-base font-medium">
          Heatmap de consistência
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Menos</span>
          <span className="h-2.5 w-2.5 rounded-[3px] bg-muted" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-primary/25" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-primary/50" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-primary/75" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
          <span>Mais</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {reversedData.map((stat) => (
          <button
            key={stat.date}
            type="button"
            title={`${stat.date}: ${stat.minutes} min`}
            onClick={() => setSelectedDate(stat.date)}
            className={cn(
              'h-4 w-4 rounded-[3px] transition-transform hover:scale-125',
              intensityClass(stat.minutes),
            )}
          />
        ))}
      </div>

      <StudyDayModal
        date={selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
    </Card>
  )
}
