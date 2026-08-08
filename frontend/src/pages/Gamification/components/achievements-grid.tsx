import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ACHIEVEMENTS, type GamificationStats } from '@/utils/achievements'

interface AchievementsGridProps {
  stats: GamificationStats
}

export function AchievementsGrid({ stats }: AchievementsGridProps) {
  return (
    <Card className="border border-border p-6">
      <h3 className="font-heading text-base font-medium">Conquistas</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = achievement.isUnlocked(stats)
          return (
            <div
              key={achievement.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3',
                unlocked
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border opacity-60',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  unlocked
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <achievement.icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {achievement.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
