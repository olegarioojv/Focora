import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPagination } from './components/admin-pagination'
import { cn } from '@/lib/utils'
import { adminApi, type AdminGroupListItem } from '@/services/admin-api'
import { ApiError } from '@/services/api-client'

export function AdminGroupsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | 'public' | 'private'>('all')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminGroupListItem[]>([])
  const [total, setTotal] = useState(0)
  const pageSize = 20

  // Debounced so typing a name doesn't fire a request per keystroke — same
  // pattern already used by Usuários/Logs.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  function reload() {
    adminApi
      .listGroups({
        search: debouncedSearch || undefined,
        type: type === 'all' ? undefined : type,
        page,
      })
      .then((response) => {
        setItems(response.items)
        setTotal(response.total)
      })
      .catch(() => {
        setItems([])
        setTotal(0)
      })
  }

  useEffect(reload, [debouncedSearch, type, page])

  async function handleDelete(group: AdminGroupListItem) {
    if (
      !window.confirm(
        `Excluir o grupo "${group.name}"? Essa ação remove todos os ${group.memberCount} membro(s) e não pode ser desfeita.`,
      )
    ) {
      return
    }
    try {
      await adminApi.deleteGroup(group.id)
      toast.success('Grupo excluído')
      reload()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível excluir o grupo',
      )
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Grupos</h2>
        <p className="text-sm text-muted-foreground">{total} grupos criados</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do grupo"
            className="pl-8"
            value={search}
            onChange={(event) => {
              setPage(1)
              setSearch(event.target.value)
            }}
          />
        </div>
        <Select
          value={type}
          onValueChange={(value) => {
            setPage(1)
            setType(value as typeof type)
          }}
        >
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="public">Público</SelectItem>
            <SelectItem value="private">Privado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border p-0">
        {items.length === 0 ? (
          <EmptyState icon="👥" title="Nenhum grupo encontrado" className="p-6" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((group) => (
              <li
                key={group.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg">
                  {group.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {group.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Dono: {group.ownerName}
                  </p>
                </div>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  Criado: {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {group.memberCount}/{group.maxMembers} membros
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                    group.type === 'public'
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {group.type === 'public' ? 'Público' : 'Privado'}
                </span>
                <button
                  type="button"
                  aria-label={`Excluir grupo ${group.name}`}
                  onClick={() => handleDelete(group)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
