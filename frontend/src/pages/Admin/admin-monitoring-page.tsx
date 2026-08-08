import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Cpu,
  Database,
  Gauge,
  MemoryStick,
  Server,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  adminApi,
  type AdminHealthSnapshot,
  type AdminRealtime,
  type AdminRequestsTimelinePoint,
} from '@/services/admin-api'

const HEALTH_POLL_MS = 5_000
const REALTIME_POLL_MS = 3_000
const TIMELINE_POLL_MS = 15_000
const UPTIME_POLL_MS = 60_000
const UPTIME_HOURS = 24
const UPTIME_SEGMENTS = 96 // 15-min buckets over 24h

function Tile({
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

function formatTimelineLabel(isoMinute: string) {
  return new Date(isoMinute).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildUptimeSegments(snapshots: AdminHealthSnapshot[]) {
  const now = Date.now()
  const windowMs = UPTIME_HOURS * 60 * 60 * 1000
  const segmentMs = windowMs / UPTIME_SEGMENTS
  const start = now - windowMs

  return Array.from({ length: UPTIME_SEGMENTS }, (_, index) => {
    const segStart = start + index * segmentMs
    const segEnd = segStart + segmentMs
    const inSegment = snapshots.filter((snap) => {
      const t = new Date(snap.createdAt).getTime()
      return t >= segStart && t < segEnd
    })
    if (inSegment.length === 0) return 'unknown' as const
    return inSegment.every((snap) => snap.dbStatus === 'online')
      ? ('online' as const)
      : ('offline' as const)
  })
}

export function AdminMonitoringPage() {
  const [apiOnline, setApiOnline] = useState(true)
  const [averageResponseMs, setAverageResponseMs] = useState<number | null>(null)
  const [history, setHistory] = useState<AdminHealthSnapshot[]>([])
  const [timeline, setTimeline] = useState<AdminRequestsTimelinePoint[]>([])
  const [realtime, setRealtime] = useState<AdminRealtime | null>(null)
  const lastHealthAt = useRef<number>(Date.now())

  useEffect(() => {
    let cancelled = false

    function pollHealth() {
      const start = Date.now()
      adminApi
        .getHealth()
        .then(() => {
          if (cancelled) return
          setApiOnline(true)
          setAverageResponseMs(Date.now() - start)
          lastHealthAt.current = Date.now()
        })
        .catch(() => {
          if (!cancelled) setApiOnline(false)
        })
    }

    pollHealth()
    const interval = setInterval(pollHealth, HEALTH_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    function pollRealtime() {
      adminApi
        .getRealtime()
        .then((data) => {
          if (!cancelled) setRealtime(data)
        })
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }

    pollRealtime()
    const interval = setInterval(pollRealtime, REALTIME_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    function pollHistory() {
      adminApi
        .getHealthHistory(UPTIME_HOURS)
        .then((data) => {
          if (!cancelled) setHistory(data)
        })
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }

    pollHistory()
    const interval = setInterval(pollHistory, UPTIME_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    function pollTimeline() {
      adminApi
        .getRequestsTimeline(60)
        .then((data) => {
          if (!cancelled) setTimeline(data)
        })
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }

    pollTimeline()
    const interval = setInterval(pollTimeline, TIMELINE_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const uptimeSegments = buildUptimeSegments(history)
  const chartData = timeline.map((point) => ({
    minute: point.minute,
    sucesso: point.total - point.errors,
    erros: point.errors,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Monitoramento</h2>
        <p className="text-sm text-muted-foreground">
          Saúde da API atualiza a cada 5s · Tempo real a cada 3s
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Saúde da API
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            icon={Server}
            label="Status da API"
            value={apiOnline ? 'Online' : 'Offline'}
            sub={apiOnline ? undefined : 'Falha ao alcançar o servidor'}
          />
          <Tile
            icon={Gauge}
            label="Tempo de resposta"
            value={averageResponseMs !== null ? `${averageResponseMs}ms` : '—'}
          />
          <Tile
            icon={Database}
            label="Banco de dados"
            value={realtime?.database.status === 'offline' ? 'Offline' : 'Online'}
            sub={
              realtime?.database.latencyMs !== null &&
              realtime?.database.latencyMs !== undefined
                ? `${realtime.database.latencyMs}ms`
                : undefined
            }
          />
          <Tile
            icon={Activity}
            label="Requisições (última hora)"
            value={String(timeline.reduce((sum, point) => sum + point.total, 0))}
          />
        </div>
      </div>

      <Card className="border border-border p-6">
        <h3 className="font-heading text-base font-medium">
          Histórico de disponibilidade (24h)
        </h3>
        <p className="text-xs text-muted-foreground">
          Cada barra é uma janela de 15 min. Cinza = sem dados (API fora do ar nesse período).
        </p>
        <div className="mt-4 flex gap-0.5">
          {uptimeSegments.map((status, index) => (
            <span
              key={index}
              title={status}
              className={cn(
                'h-8 flex-1 rounded-sm',
                status === 'online' && 'bg-success',
                status === 'offline' && 'bg-destructive',
                status === 'unknown' && 'bg-muted',
              )}
            />
          ))}
        </div>
      </Card>

      <Card className="border border-border p-6">
        <h3 className="font-heading text-base font-medium">
          Requisições por minuto (última hora)
        </h3>
        <p className="text-xs text-muted-foreground">
          Atualiza a cada 15s
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="minute"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatTimelineLabel}
                interval={9}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(value) => formatTimelineLabel(String(value))}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--popover-foreground)',
                }}
              />
              <Bar dataKey="sucesso" stackId="requests" fill="var(--primary)" name="Requisições" radius={[0, 0, 0, 0]} />
              <Bar dataKey="erros" stackId="requests" fill="var(--destructive)" name="Erros (4xx/5xx)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Tempo real
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            icon={Users}
            label="Usuários ativos"
            value={realtime ? String(realtime.activeUsers) : '—'}
            sub="Últimos 5 min"
          />
          <Tile
            icon={Activity}
            label="Requisições/seg"
            value={realtime ? String(realtime.requestsPerSecond) : '—'}
          />
          <Tile
            icon={Cpu}
            label="CPU (processo)"
            value={realtime ? `${realtime.process.cpuPercent}%` : '—'}
          />
          <Tile
            icon={MemoryStick}
            label="Memória (RSS)"
            value={realtime ? `${realtime.process.memory.rssMb}MB` : '—'}
          />
        </div>
      </div>
    </div>
  )
}
