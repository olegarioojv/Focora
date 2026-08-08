import { Crown, Flame, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getLevelProgress } from '@/utils/gamification'
import type { GroupMemberEntry } from '@/services/groups-api'

interface GroupMemberCardProps {
  member: GroupMemberEntry
  canKick: boolean
  onKick?: () => void
}

export function GroupMemberCard({ member, canKick, onKick }: GroupMemberCardProps) {
  const { level } = getLevelProgress(member.xp)
  const weeklyHours = Math.round((member.weeklyMinutes / 60) * 10) / 10

  return (
    <Card className="border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11">
            <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
            <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
              {member.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            title={member.isOnline ? 'Online' : 'Offline'}
            className={cn(
              'absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card',
              member.isOnline ? 'bg-success' : 'bg-muted-foreground/40',
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium text-foreground">
              {member.name}
            </p>
            {member.isOwner && <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground">Nível {level}</p>
        </div>
        {canKick && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onKick}
          >
            Remover
          </Button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 rounded-lg border border-border p-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">{member.xp} XP</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border p-2">
          <Flame className="h-3.5 w-3.5 text-red-500" />
          <span className="text-foreground">{member.currentStreak} dias seguidos</span>
        </div>
        <div className="rounded-lg border border-border p-2">
          <p className="text-muted-foreground">Horas na semana</p>
          <p className="font-medium text-foreground">{weeklyHours}h</p>
        </div>
        <div className="rounded-lg border border-border p-2">
          <p className="text-muted-foreground">Dias concluídos</p>
          <p className="font-medium text-foreground">{member.daysCompleted}</p>
        </div>
      </div>
    </Card>
  )
}
