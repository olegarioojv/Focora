import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminPagination } from './components/admin-pagination'
import { cn } from '@/lib/utils'
import { adminApi, type AdminUserListItem } from '@/services/admin-api'

function accountTypeLabel(user: AdminUserListItem) {
  if (user.role === 'admin') return 'Admin'
  if (user.isGuest) return 'Convidado'
  return 'Usuário'
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'all' | 'admin' | 'user' | 'guest'>('all')
  const [status, setStatus] = useState<'all' | 'active' | 'blocked'>('all')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminUserListItem[]>([])
  const [total, setTotal] = useState(0)
  const pageSize = 20

  // Debounced so typing a name/e-mail doesn't fire a request per
  // keystroke — same pattern already used by the Groups public search.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  useEffect(() => {
    adminApi
      .listUsers({
        search: debouncedSearch || undefined,
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
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
  }, [debouncedSearch, role, status, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Usuários</h2>
        <p className="text-sm text-muted-foreground">{total} usuários cadastrados</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail"
            className="pl-8"
            value={search}
            onChange={(event) => {
              setPage(1)
              setSearch(event.target.value)
            }}
          />
        </div>
        <Select
          value={role}
          onValueChange={(value) => {
            setPage(1)
            setRole(value as typeof role)
          }}
        >
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="guest">Convidado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1)
            setStatus(value as typeof status)
          }}
        >
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="blocked">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border p-0">
        {items.length === 0 ? (
          <EmptyState icon="🔍" title="Nenhum usuário encontrado" className="p-6" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted/50"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email ?? 'sem e-mail'}
                    </p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    Cadastro: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="hidden text-xs text-muted-foreground md:block">
                    Último acesso:{' '}
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      user.role === 'admin'
                        ? 'bg-primary/15 text-primary'
                        : user.isGuest
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-success/15 text-success',
                    )}
                  >
                    {accountTypeLabel(user)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      user.blocked
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-border text-muted-foreground',
                    )}
                  >
                    {user.blocked ? 'Bloqueado' : 'Ativo'}
                  </span>
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
