import { XpLevelCard } from './components/xp-level-card'
import { AchievementsGrid } from './components/achievements-grid'
import { RankingCard } from './components/ranking-card'
import { useGamificationStore } from '@/stores/gamification-store'
import { getLevelProgress } from '@/utils/gamification'

export function GamificationPage() {
  const xp = useGamificationStore((state) => state.xp)
  const totalPomodoros = useGamificationStore((state) => state.totalPomodoros)
  const totalTasksCompleted = useGamificationStore(
    (state) => state.totalTasksCompleted,
  )
  const totalReviewsCompleted = useGamificationStore(
    (state) => state.totalReviewsCompleted,
  )
  const { level } = getLevelProgress(xp)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Gamificação
        </h1>
        <p className="text-sm text-muted-foreground">
          Ganhe XP completando Pomodoros, tarefas do cronograma e revisões.
        </p>
      </div>

      <XpLevelCard xp={xp} />
      <AchievementsGrid
        stats={{
          totalPomodoros,
          totalTasksCompleted,
          totalReviewsCompleted,
          level,
        }}
      />
      <RankingCard />
    </div>
  )
}
