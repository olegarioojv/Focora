import { useState } from 'react'
import { Flame, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { GroupMemberEntry } from '@/services/groups-api'

type RankingCriterion = 'xp' | 'weeklyMinutes' | 'currentStreak'

const CRITERIA: { key: RankingCriterion; label: string }[] = [
  { key: 'xp', label: 'XP' },
  { key: 'weeklyMinutes', label: 'Horas estudadas' },
  { key: 'currentStreak', label: 'Sequência' },
]

const MEDALS = ['🥇', '🥈', '🥉']

function formatValue(criterion: RankingCriterion, member: GroupMemberEntry) {
  if (criterion === 'xp') return `${member.xp} XP`
  if (criterion === 'weeklyMinutes') {
    return `${Math.round((member.weeklyMinutes / 60) * 10) / 10}h`
  }
  return `${member.currentStreak} dias`
}

interface GroupRankingCardProps {
  members: GroupMemberEntry[]
}

export function GroupRankingCard({ members }: GroupRankingCardProps) {
  const [criterion, setCriterion] = useState<RankingCriterion>('xp')

  const sorted = [...members].sort((a, b) => b[criterion] - a[criterion])
  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <Card className="border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-base font-medium">Ranking do grupo</h3>
        <p className="text-xs text-muted-foreground">Atualiza automaticamente</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CRITERIA.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCriterion(item.key)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              criterion === item.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-accent',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon="🥇"
          title="Ainda sem participantes suficientes"
          description="O ranking aparece assim que o grupo tiver atividade."
        />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-3 items-end gap-2">
            {[podium[1], podium[0], podium[2]].map((member, columnIndex) => {
              if (!member) return <div key={columnIndex} />
              const place = columnIndex === 1 ? 0 : columnIndex === 0 ? 1 : 2
              const height = place === 0 ? 'h-28' : place === 1 ? 'h-20' : 'h-14'
              return (
                <div key={member.userId} className="flex flex-col items-center gap-1.5">
                  <Avatar className={cn('border-2', place === 0 ? 'h-14 w-14 border-primary' : 'h-11 w-11 border-border')}>
                    <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                    <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="max-w-full truncate text-xs font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-primary">{formatValue(criterion, member)}</p>
                  <div
                    className={cn(
                      'flex w-full items-start justify-center rounded-t-lg bg-primary/10 pt-1.5',
                      height,
                    )}
                  >
                    <span className="text-xl">{MEDALS[place]}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {rest.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              {rest.map((member, index) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                >
                  <span className="w-5 shrink-0 text-center text-sm font-medium text-muted-foreground">
                    {index + 4}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                    <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-sm text-foreground">
                    {member.name}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    {criterion === 'xp' && <Zap className="h-3.5 w-3.5" />}
                    {criterion === 'currentStreak' && <Flame className="h-3.5 w-3.5 text-red-500" />}
                    {formatValue(criterion, member)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
