import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useRankingStore } from '@/stores/ranking-store'
import { useAuthStore } from '@/stores/auth-store'

export function RankingCard() {
  const entries = useRankingStore((state) => state.entries)
  const currentUserId = useAuthStore((state) => state.user?.id)

  return (
    <Card className="border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-base font-medium">Ranking</h3>
        <span className="text-xs text-muted-foreground">
          Top {entries.length} por XP
        </span>
      </div>
      {entries.length === 0 ? (
        <EmptyState
          className="mt-2"
          icon="🏆"
          title="Ainda sem ranking"
          description="Estude um pouco pra aparecer aqui."
        />
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.id === currentUserId
            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-2.5',
                  isCurrentUser
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border',
                )}
              >
                <span className="w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatarUrl ?? undefined} alt={entry.name} />
                  <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'flex-1 truncate text-sm text-foreground',
                    isCurrentUser && 'font-semibold',
                  )}
                >
                  {isCurrentUser ? 'Você' : entry.name}
                </span>
                <span className="text-sm font-medium text-primary">
                  {entry.xp} XP
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
