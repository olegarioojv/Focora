import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Search, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateGroupModal } from './components/create-group-modal'
import { GroupCard } from './components/group-card'
import { groupsApi, type PublicGroupSummary } from '@/services/groups-api'
import { ApiError } from '@/services/api-client'
import { useGroupsStore } from '@/stores/groups-store'

function GroupCardSkeleton() {
  return (
    <Card className="flex items-center gap-4 border border-border p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>
      <Skeleton className="h-8 w-16 shrink-0 rounded-lg" />
    </Card>
  )
}

export function GroupsPage() {
  const navigate = useNavigate()
  const groups = useGroupsStore((state) => state.groups)
  const hydrate = useGroupsStore((state) => state.hydrate)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [publicGroups, setPublicGroups] = useState<PublicGroupSummary[]>([])
  const [publicLoading, setPublicLoading] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    groupsApi
      .list()
      .then(hydrate)
      .catch(() => toast.error('Não foi possível carregar seus grupos'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPublicLoading(true)
    const handle = setTimeout(() => {
      groupsApi
        .listPublic(search || undefined)
        .then(setPublicGroups)
        .catch(() => toast.error('Não foi possível carregar grupos públicos'))
        .finally(() => setPublicLoading(false))
    }, 300)
    return () => clearTimeout(handle)
  }, [search])

  async function handleJoin(group: PublicGroupSummary) {
    setJoiningId(group.id)
    try {
      await groupsApi.join(group.inviteCode)
      toast.success(`Você entrou em "${group.name}"`)
      navigate(`/app/grupos/${group.id}`)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível entrar no grupo',
      )
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/app"
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Início
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Grupos de Estudo
          </h1>
          <p className="text-sm text-muted-foreground">
            Estude junto, compita de forma saudável e acompanhe sua turma.
          </p>
        </div>
        <CreateGroupModal
          onCreated={(group) =>
            hydrate([
              {
                id: group.id,
                name: group.name,
                description: group.description,
                icon: group.icon,
                type: group.type,
                maxMembers: group.maxMembers,
                memberCount: group.members.length,
                isOwner: group.isOwner,
              },
              ...groups,
            ])
          }
          trigger={
            <Button type="button">
              <Plus className="h-4 w-4" />
              Criar grupo
            </Button>
          }
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-foreground">Meus grupos</h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </div>
        ) : groups.length === 0 ? (
          <Card className="flex min-h-24 items-center justify-center border border-dashed border-border p-6">
            <EmptyState
              icon="👥"
              title="Você ainda não participa de nenhum grupo"
              description="Crie um grupo ou entre em um público abaixo."
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-foreground">
            Explorar grupos públicos
          </h2>
          <div className="relative w-56">
            <Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {publicLoading ? (
          <div className="flex flex-col gap-3">
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </div>
        ) : publicGroups.length === 0 ? (
          <Card className="flex min-h-24 items-center justify-center border border-dashed border-border p-6">
            <EmptyState icon="🔍" title="Nenhum grupo público encontrado" />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {publicGroups.map((group) => (
              <Card
                key={group.id}
                className="flex items-center gap-4 border border-border p-4"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-2xl">
                  {group.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {group.name}
                  </p>
                  {group.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {group.memberCount}/{group.maxMembers} participantes
                  </p>
                </div>
                {group.isMember ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link to={`/app/grupos/${group.id}`}>Já é membro</Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={joiningId === group.id}
                    onClick={() => handleJoin(group)}
                  >
                    {joiningId === group.id ? 'Entrando...' : 'Entrar'}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
