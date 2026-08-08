import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupMemberCard } from './components/group-member-card'
import { GroupRankingCard } from './components/group-ranking-card'
import { InvitePanel } from './components/invite-panel'
import { GroupSettingsModal } from './components/group-settings-modal'
import { groupsApi, type GroupDetail } from '@/services/groups-api'
import { ApiError } from '@/services/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { useGroupsStore } from '@/stores/groups-store'

const POLL_MS = 15_000

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const removeFromStore = useGroupsStore((state) => state.groups)
  const hydrateGroups = useGroupsStore((state) => state.hydrate)

  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!id) return
    groupsApi
      .get(id)
      .then((data) => {
        setGroup(data)
        setError(null)
      })
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : 'Não foi possível carregar o grupo',
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
    const interval = setInterval(load, POLL_MS)
    return () => clearInterval(interval)
  }, [load])

  function handleGroupGone() {
    hydrateGroups(removeFromStore.filter((item) => item.id !== id))
    navigate('/app/grupos')
  }

  async function handleLeave() {
    if (!id || !window.confirm('Sair deste grupo?')) return
    try {
      await groupsApi.leave(id)
      toast.success('Você saiu do grupo')
      handleGroupGone()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível sair do grupo',
      )
    }
  }

  async function handleKick(userId: string, name: string) {
    if (!id || !window.confirm(`Remover ${name} do grupo?`)) return
    try {
      await groupsApi.kick(id, userId)
      toast.success(`${name} foi removido do grupo`)
      load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível remover o membro',
      )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <Card className="flex min-h-32 flex-col items-center justify-center gap-3 border border-dashed border-border p-6">
        <EmptyState
          icon="😕"
          title={error ?? 'Grupo não encontrado'}
          action={
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/app/grupos">Voltar para Grupos</Link>
            </Button>
          }
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/app/grupos"
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Grupos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-3xl">
            {group.icon}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground">
              {group.name}
            </h1>
            {group.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {group.members.length}/{group.maxMembers} participantes ·{' '}
              {group.type === 'public' ? 'Público' : 'Privado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {group.isOwner ? (
            <GroupSettingsModal
              group={group}
              onUpdated={setGroup}
              onDeleted={handleGroupGone}
            />
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={handleLeave}>
              <LogOut className="h-3.5 w-3.5" />
              Sair do grupo
            </Button>
          )}
        </div>
      </div>

      <InvitePanel groupName={group.name} inviteCode={group.inviteCode} />

      <GroupRankingCard members={group.members} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-foreground">
          Participantes ({group.members.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.members.map((member) => (
            <GroupMemberCard
              key={member.userId}
              member={member}
              canKick={group.isOwner && member.userId !== currentUserId}
              onKick={() => handleKick(member.userId, member.name)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
