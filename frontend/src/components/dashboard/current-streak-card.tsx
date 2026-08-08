import { Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGamificationStore } from '@/stores/gamification-store'

export function CurrentStreakCard() {
  const currentStreak = useGamificationStore((state) => state.currentStreak)
  const daysIntoWeek = currentStreak % 7
  const daysToMilestone = daysIntoWeek === 0 ? 7 : 7 - daysIntoWeek
  const weekProgress = (daysIntoWeek / 7) * 100

  return (
    <Card className="border border-border p-5">
      <div className="flex items-center gap-3">
        <Flame className="h-9 w-9 shrink-0 fill-orange-400 text-orange-400" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Sequência Atual
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-foreground">
              {currentStreak}
            </span>
            <span className="text-sm text-muted-foreground">
              dias seguidos
            </span>
          </p>
        </div>
      </div>

      <Progress value={weekProgress} className="mt-4 h-1.5" />
      <p className="mt-2 text-xs text-muted-foreground">
        Faltam{' '}
        <span className="font-medium text-foreground">
          {daysToMilestone}
        </span>{' '}
        {daysToMilestone === 1 ? 'dia' : 'dias'} para completar mais uma
        semana 🔥
      </p>
    </Card>
  )
}
