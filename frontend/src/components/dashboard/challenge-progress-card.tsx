import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/charts/circular-progress'
import { useGamificationStore } from '@/stores/gamification-store'
import { getChallengeDayNumber } from '@/utils/challenge-day'

const TOTAL_DAYS = 100

export function ChallengeProgressCard() {
  const challengeStartDate = useGamificationStore(
    (state) => state.challengeStartDate,
  )
  const daysCompleted = Math.min(
    TOTAL_DAYS,
    getChallengeDayNumber(challengeStartDate),
  )
  const percentage = Math.round((daysCompleted / TOTAL_DAYS) * 100)
  const remainingDays = TOTAL_DAYS - daysCompleted

  return (
    <Card className="flex-row flex-wrap items-center justify-between gap-6 border border-border p-6 sm:flex-nowrap">
      <CircularProgress value={percentage} label="concluído" />

      <div className="min-w-[200px] flex-1">
        <p className="text-sm font-medium text-foreground">
          Progresso do Desafio
        </p>
        <p className="mt-1 text-3xl font-semibold">
          <span className="text-primary">{daysCompleted}</span>
          <span className="text-muted-foreground"> / {TOTAL_DAYS} dias</span>
        </p>
        <Progress value={percentage} className="mt-3 h-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          Faltam{' '}
          <span className="font-medium text-primary">{remainingDays} dias</span>{' '}
          para completar o desafio!
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Trophy className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-foreground">Objetivo</p>
        <p className="text-xs text-muted-foreground">
          {TOTAL_DAYS} dias de consistência
        </p>
      </div>
    </Card>
  )
}
