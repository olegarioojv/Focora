import { Link } from 'react-router-dom'
import { Crown, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { GroupSummary } from '@/services/groups-api'

interface GroupCardProps {
  group: GroupSummary
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="flex items-center gap-4 border border-border p-4">
      <div className="relative shrink-0">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-2xl">
          {group.icon}
        </span>
        {group.hasUnreadMessages && (
          <span
            title="Novas mensagens"
            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-destructive"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-foreground">
            {group.name}
          </p>
          {group.isOwner && (
            <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
        </div>
        {group.description && (
          <p className="truncate text-xs text-muted-foreground">
            {group.description}
          </p>
        )}
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {group.memberCount}/{group.maxMembers} participantes ·{' '}
          {group.type === 'public' ? 'Público' : 'Privado'}
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to={`/app/grupos/${group.id}`}>Abrir</Link>
      </Button>
    </Card>
  )
}
