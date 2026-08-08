import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { adminApi, type AdminAlert } from '@/services/admin-api'

const TYPE_LABELS: Record<string, string> = {
  db_down: 'Banco indisponível',
  high_cpu: 'Uso elevado de CPU',
  high_memory: 'Uso elevado de memória',
  many_errors: 'Muitas exceções',
  many_login_failures: 'Muitas falhas de login',
  request_spike: 'Pico de requisições',
}

export function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([])

  useEffect(() => {
    adminApi.listAlerts().then(setAlerts).catch(() => setAlerts([]))
  }, [])

  const open = alerts.filter((alert) => !alert.resolvedAt)
  const resolved = alerts.filter((alert) => alert.resolvedAt)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Alertas</h2>
        <p className="text-sm text-muted-foreground">
          Avaliados a cada 30s a partir de dados reais (banco, CPU, memória, erros, logins, requisições).
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Ativos ({open.length})
        </p>
        {open.length === 0 ? (
          <Card className="flex min-h-24 items-center justify-center border border-dashed border-border p-6">
            <EmptyState icon="🎉" title="Nenhum alerta ativo" />
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {open.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  'border p-4',
                  alert.severity === 'critical'
                    ? 'border-destructive/40 bg-destructive/5'
                    : 'border-orange-400/40 bg-orange-400/5',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      alert.severity === 'critical'
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-orange-400/15 text-orange-400',
                    )}
                  >
                    {alert.severity === 'critical' ? 'Crítico' : 'Atenção'}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {TYPE_LABELS[alert.type] ?? alert.type}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    desde {new Date(alert.triggeredAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Resolvidos recentemente
        </p>
        {resolved.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum alerta resolvido ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {resolved.slice(0, 20).map((alert) => (
              <Card key={alert.id} className="border border-border p-4 opacity-70">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Resolvido
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {TYPE_LABELS[alert.type] ?? alert.type}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(alert.triggeredAt).toLocaleString('pt-BR')} →{' '}
                    {alert.resolvedAt && new Date(alert.resolvedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
