import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { adminApi, type AdminErrorEntry } from '@/services/admin-api'

export function AdminErrorsPage() {
  const [errors, setErrors] = useState<AdminErrorEntry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    adminApi.listErrors().then(setErrors).catch(() => setErrors([]))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Erros</h2>
        <p className="text-sm text-muted-foreground">
          {errors.length} erro(s) agrupado(s) — ordenados pela ocorrência mais recente
        </p>
      </div>

      {errors.length === 0 ? (
        <Card className="flex min-h-32 items-center justify-center border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum erro registrado. 🎉
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {errors.map((error) => {
            const isExpanded = expandedId === error.id
            return (
              <Card key={error.id} className="border border-border p-0">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : error.id)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left"
                >
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      error.severity === 'fatal'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {error.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {error.message}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {error.method} {error.endpoint ?? '—'} · {error.environment}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {error.occurrenceCount}x
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    Última: {new Date(error.lastSeenAt).toLocaleString('pt-BR')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-4">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground">Primeira ocorrência</p>
                        <p className="text-foreground">
                          {new Date(error.firstSeenAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Última ocorrência</p>
                        <p className="text-foreground">
                          {new Date(error.lastSeenAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ambiente</p>
                        <p className="text-foreground">{error.environment}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usuário</p>
                        <p className="text-foreground">{error.userId ?? '—'}</p>
                      </div>
                    </div>
                    {error.stack && (
                      <>
                        <p className="mt-3 text-xs font-medium text-muted-foreground">
                          Stack trace
                        </p>
                        <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-muted p-3 font-mono text-[11px] text-foreground">
                          {error.stack}
                        </pre>
                      </>
                    )}
                    {error.payload != null && (
                      <>
                        <p className="mt-3 text-xs font-medium text-muted-foreground">
                          Payload da requisição (dados sensíveis mascarados)
                        </p>
                        <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-muted p-3 font-mono text-[11px] text-foreground">
                          {JSON.stringify(error.payload, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
