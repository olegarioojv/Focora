import { useEffect, useState } from 'react'
import {
  Activity,
  Clock,
  Database,
  Flame,
  Gauge,
  Server,
  UserPlus,
  Users,
  UserCheck,
  Calendar,
  Cpu,
  MemoryStick,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { adminApi, type AdminMetrics } from '@/services/admin-api'

const POLL_INTERVAL_MS = 15_000

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="border border-border p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </Card>
  )
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)

  useEffect(() => {
    let cancelled = false

    function load() {
      adminApi
        .getMetrics()
        .then((data) => {
          if (!cancelled) setMetrics(data)
        })
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }

    load()
    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!metrics) {
    return (
      <p className="text-sm text-muted-foreground">Carregando métricas...</p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Atualiza automaticamente a cada 15 segundos.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Usuários
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Users} label="Total de usuários" value={String(metrics.users.total)} />
          <MetricCard icon={UserCheck} label="Ativos hoje" value={String(metrics.users.activeToday)} />
          <MetricCard icon={UserPlus} label="Novos cadastros hoje" value={String(metrics.users.newToday)} />
          <MetricCard icon={Users} label="Usuários convidados" value={String(metrics.users.guests)} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Estudo na plataforma
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard icon={Clock} label="Horas estudadas (total)" value={`${metrics.totalHoursStudied}h`} />
          <MetricCard icon={Calendar} label="Dias concluídos (total)" value={String(metrics.totalDaysCompleted)} />
          <MetricCard icon={Flame} label="Média de sequência" value={`${metrics.averageStreak} dias`} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Saúde do sistema
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Server}
            label="Status da API"
            value={metrics.api.status === 'online' ? 'Online' : 'Offline'}
          />
          <MetricCard
            icon={Database}
            label="Status do banco"
            value={metrics.database.status === 'online' ? 'Online' : 'Offline'}
            sub={
              metrics.database.latencyMs !== null
                ? `${metrics.database.latencyMs}ms de latência`
                : undefined
            }
          />
          <MetricCard icon={MemoryStick} label="Uso de memória" value={`${metrics.process.memory.rssMb}MB`} sub={`Heap: ${metrics.process.memory.heapUsedMb}/${metrics.process.memory.heapTotalMb}MB`} />
          <MetricCard icon={Cpu} label="Uso de CPU (processo)" value={`${metrics.process.cpuPercent}%`} />
          <MetricCard icon={Gauge} label="Tempo médio de resposta" value={`${metrics.api.averageResponseMs}ms`} sub="Última hora" />
          <MetricCard icon={Activity} label="Requisições na última hora" value={String(metrics.api.requestsLastHour)} />
        </div>
      </div>
    </div>
  )
}
