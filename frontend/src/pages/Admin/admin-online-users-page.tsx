import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { adminApi, type AdminOnlineUser } from '@/services/admin-api'

const POLL_MS = 15_000

function accountTypeLabel(user: AdminOnlineUser) {
  if (user.role === 'admin') return 'Admin'
  if (user.isGuest) return 'Convidado'
  return 'Usuário'
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'agora mesmo'
  const minutes = Math.round(seconds / 60)
  return `há ${minutes} min`
}

export function AdminOnlineUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminOnlineUser[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    function poll() {
      adminApi
        .listOnlineUsers()
        .then((response) => {
          setUsers(response)
          setLoaded(true)
        })
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }
    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Usuários online</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} usuário(s) ativos nos últimos 5 minutos
        </p>
      </div>

      <Card className="border border-border p-0">
        {!loaded ? null : users.length === 0 ? (
          <EmptyState
            icon="📡"
            title="Ninguém online agora"
            description="Assim que alguém usar a plataforma, essa lista atualiza sozinha."
            className="p-6"
          />
        ) : (
          <ul className="divide-y divide-border">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted/50"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                      <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      title="Online agora"
                      className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-success"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email ?? 'sem e-mail'}
                    </p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {timeAgo(user.lastSeenAt)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                      user.role === 'admin'
                        ? 'bg-primary/15 text-primary'
                        : user.isGuest
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-success/15 text-success',
                    )}
                  >
                    {accountTypeLabel(user)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
