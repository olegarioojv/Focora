import { Trophy, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useGamificationStore } from '@/stores/gamification-store'
import { useRankingStore } from '@/stores/ranking-store'
import { useAuthStore } from '@/stores/auth-store'
import { getLevelProgress } from '@/utils/gamification'
import { ACHIEVEMENTS } from '@/utils/achievements'

export function GamificationModal() {
  const xp = useGamificationStore((state) => state.xp)
  const totalPomodoros = useGamificationStore((state) => state.totalPomodoros)
  const totalTasksCompleted = useGamificationStore(
    (state) => state.totalTasksCompleted,
  )
  const totalReviewsCompleted = useGamificationStore(
    (state) => state.totalReviewsCompleted,
  )
  const { level, xpIntoLevel, xpForNextLevel, progressPercent } =
    getLevelProgress(xp)

  const stats = { totalPomodoros, totalTasksCompleted, totalReviewsCompleted, level }
  const fullRanking = useRankingStore((state) => state.entries)
  const currentUserId = useAuthStore((state) => state.user?.id)
  const currentUserIndex = fullRanking.findIndex(
    (entry) => entry.id === currentUserId,
  )
  const ranking =
    currentUserIndex < 0
      ? fullRanking.slice(0, 4)
      : currentUserIndex < 4
        ? fullRanking.slice(0, 4)
        : [...fullRanking.slice(0, 3), fullRanking[currentUserIndex]]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Ver gamificação"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
        >
          <Trophy className="h-4.5 w-4.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gamificação</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Zap className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-foreground">
                  Nível {level}
                </p>
                <p className="text-xs font-medium text-primary">{xp} XP</p>
              </div>
              <Progress value={progressPercent} className="mt-1.5 h-1.5" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {xpIntoLevel} / {xpForNextLevel} XP para o próximo nível
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Conquistas
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = achievement.isUnlocked(stats)
                return (
                  <div
                    key={achievement.id}
                    title={achievement.description}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-2 text-center',
                      unlocked
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border opacity-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        unlocked
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <achievement.icon className="h-4 w-4" />
                    </span>
                    <p className="text-[10px] leading-tight text-foreground">
                      {achievement.title}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Ranking
            </p>
            <div className="flex flex-col gap-1.5">
              {ranking.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Ainda não há dados suficientes para montar o ranking.
                </p>
              )}
              {ranking.map((entry) => {
                const isCurrentUser = entry.id === currentUserId
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5',
                      isCurrentUser
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border',
                    )}
                  >
                    <span className="w-4 shrink-0 text-center text-xs font-medium text-muted-foreground">
                      {fullRanking.findIndex((item) => item.id === entry.id) + 1}
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/15 text-[10px] font-medium text-primary">
                        {entry.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        'flex-1 truncate text-xs text-foreground',
                        isCurrentUser && 'font-semibold',
                      )}
                    >
                      {isCurrentUser ? 'Você' : entry.name}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {entry.xp} XP
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
