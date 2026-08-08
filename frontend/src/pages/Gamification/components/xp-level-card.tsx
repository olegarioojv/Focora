import { Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getLevelProgress } from '@/utils/gamification'

interface XpLevelCardProps {
  xp: number
}

export function XpLevelCard({ xp }: XpLevelCardProps) {
  const { level, xpIntoLevel, xpForNextLevel, progressPercent } =
    getLevelProgress(xp)

  return (
    <Card className="border border-border p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Zap className="h-7 w-7" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Nível</p>
          <p className="text-3xl font-semibold text-foreground">{level}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-muted-foreground">XP total</p>
          <p className="text-xl font-semibold text-primary">{xp} XP</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{xpIntoLevel} XP</span>
          <span>{xpForNextLevel} XP para o próximo nível</span>
        </div>
        <Progress value={progressPercent} className="mt-1.5 h-2" />
      </div>
    </Card>
  )
}
