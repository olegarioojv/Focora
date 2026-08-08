import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, Flame, Trophy, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { StudyHeatmap } from '@/components/charts/study-heatmap'
import { MonthlyHoursChart } from '@/components/charts/monthly-hours-chart'
import { fillDailyStats, getChallengeChartData } from '@/utils/daily-logs'
import { generateChallengeCalendar } from '@/utils/generate-challenge-calendar'
import { adminApi, type AdminUserDetail } from '@/services/admin-api'
import { ApiError } from '@/services/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { CalendarDayStatus } from '@/types/dashboard'

const TOTAL_DAYS = 100

const STATUS_STYLES: Record<CalendarDayStatus, string> = {
  completed: 'border-success text-success',
  missed: 'border-destructive text-destructive',
  today: 'border-primary bg-primary text-primary-foreground',
  future: 'border-border text-muted-foreground',
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentAdminId = useAuthStore((state) => state.user?.id)
  const isSelf = id === currentAdminId
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [busy, setBusy] = useState(false)

  function reload() {
    if (!id) return
    adminApi
      .getUser(id)
      .then(setDetail)
      .catch((error) => {
        toast.error(
          error instanceof ApiError ? error.message : 'Não foi possível carregar o usuário',
        )
      })
  }

  useEffect(reload, [id])

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    if (!id) return
    setBusy(true)
    try {
      await action()
      toast.success(successMessage)
      reload()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível concluir a ação',
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    setBusy(true)
    try {
      await adminApi.deleteUser(id)
      toast.success('Conta excluída')
      navigate('/admin/users')
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível excluir a conta',
      )
      setBusy(false)
    }
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-52" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-2xl lg:col-span-1" />
          <Skeleton className="h-40 w-full rounded-2xl lg:col-span-2" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  const { account, evolution, goals } = detail
  const initials = account.name.slice(0, 2).toUpperCase()
  const heatmapData = fillDailyStats(evolution.dailyLogs, 100)
  const monthlyData = evolution.challengeStartDate
    ? getChallengeChartData(evolution.dailyLogs, evolution.challengeStartDate)
    : []
  const activeDates = new Set(
    evolution.dailyLogs.filter((log) => log.minutes > 0).map((log) => log.date),
  )
  const calendarDays = evolution.challengeStartDate
    ? generateChallengeCalendar(TOTAL_DAYS, evolution.challengeStartDate, activeDates)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={account.avatarUrl ?? undefined} alt={account.name} />
          <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{account.name}</h2>
          <p className="text-sm text-muted-foreground">{account.email ?? 'sem e-mail'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              account.role === 'admin'
                ? 'bg-primary/15 text-primary'
                : account.isGuest
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-success/15 text-success',
            )}
          >
            {account.role === 'admin' ? 'Admin' : account.isGuest ? 'Convidado' : 'Usuário'}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              account.blocked ? 'bg-destructive/15 text-destructive' : 'bg-border text-muted-foreground',
            )}
          >
            {account.blocked ? 'Bloqueado' : 'Ativo'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-border p-5 lg:col-span-1">
          <h3 className="font-heading text-base font-medium">Informações</h3>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Cadastro</dt>
              <dd className="text-foreground">
                {new Date(account.createdAt).toLocaleString('pt-BR')}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Último login</dt>
              <dd className="text-foreground">
                {account.lastLoginAt
                  ? new Date(account.lastLoginAt).toLocaleString('pt-BR')
                  : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">IP do último acesso</dt>
              <dd className="text-foreground">{account.lastLoginIp ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Navegador</dt>
              <dd className="text-foreground">{account.lastLoginBrowser ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Sistema operacional</dt>
              <dd className="text-foreground">{account.lastLoginOs ?? '—'}</dd>
            </div>
          </dl>
        </Card>

        <Card className="border border-border p-5 lg:col-span-2">
          <h3 className="font-heading text-base font-medium">Evolução</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{evolution.daysActive}</p>
              <p className="text-[11px] text-muted-foreground">Dias estudados</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{evolution.totalHours}h</p>
              <p className="text-[11px] text-muted-foreground">Horas estudadas</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                <Flame className="h-4 w-4 text-orange-400" />
                {evolution.currentStreak}
              </p>
              <p className="text-[11px] text-muted-foreground">Sequência atual</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="flex items-center justify-center gap-1 text-lg font-semibold text-foreground">
                <Trophy className="h-4 w-4 text-primary" />
                {evolution.longestStreak}
              </p>
              <p className="text-[11px] text-muted-foreground">Maior sequência</p>
            </div>
          </div>
        </Card>
      </div>

      {evolution.challengeStartDate && (
        <Card className="border border-border p-6">
          <h3 className="font-heading text-base font-medium">Calendário de Dias</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {calendarDays.map(({ day, status }) => (
              <span
                key={day}
                className={cn(
                  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium',
                  STATUS_STYLES[status],
                )}
              >
                {day}
                {status === 'completed' && (
                  <span className="absolute -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card bg-success text-card">
                    <Check className="h-2 w-2" strokeWidth={3} />
                  </span>
                )}
                {status === 'missed' && (
                  <span className="absolute -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card bg-destructive text-card">
                    <X className="h-2 w-2" strokeWidth={3} />
                  </span>
                )}
              </span>
            ))}
          </div>
        </Card>
      )}

      <StudyHeatmap data={heatmapData} />
      {monthlyData.length > 0 && <MonthlyHoursChart data={monthlyData} />}

      <Card className="border border-border p-5">
        <h3 className="font-heading text-base font-medium">Metas</h3>
        {goals.length === 0 ? (
          <EmptyState icon="📚" title="Nenhuma matéria cadastrada" />
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="text-foreground">{goal.name}</span>
                <span className="text-xs text-muted-foreground">{goal.progress}%</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border border-border p-5">
        <h3 className="font-heading text-base font-medium">Ações</h3>
        {isSelf && (
          <p className="mt-1 text-xs text-muted-foreground">
            Não é possível bloquear, alterar a permissão ou excluir a própria conta.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {account.blocked ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy || isSelf}
              onClick={() => void runAction(() => adminApi.unblockUser(account.id), 'Usuário desbloqueado')}
            >
              Desbloquear
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={busy || isSelf}
              onClick={() => {
                if (!window.confirm(`Bloquear ${account.name}? A conta perde acesso imediatamente.`)) return
                void runAction(() => adminApi.blockUser(account.id), 'Usuário bloqueado')
              }}
            >
              Bloquear
            </Button>
          )}

          <Select
            value={account.role}
            disabled={busy || isSelf}
            onValueChange={(value) =>
              void runAction(
                () => adminApi.updateRole(account.id, value as 'user' | 'admin'),
                'Permissão atualizada',
              )
            }
          >
            <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" disabled={busy}>
                Resetar progresso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Resetar progresso?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Isso zera XP, sequência, horas estudadas e o histórico de dias
                deste usuário. Matérias e cronograma são mantidos. Não pode ser
                desfeito.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  onClick={() =>
                    void runAction(() => adminApi.resetProgress(account.id), 'Progresso resetado')
                  }
                >
                  Confirmar reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={busy || isSelf}>
                Excluir conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Excluir esta conta?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Remove permanentemente a conta de {account.name} e todos os
                dados associados. Não pode ser desfeito.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => void handleDelete()}
                >
                  Excluir permanentemente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  )
}
