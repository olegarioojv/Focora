import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminPagination } from './components/admin-pagination'
import { cn } from '@/lib/utils'
import { adminApi, type AdminLogEntry } from '@/services/admin-api'

function statusColor(status: number) {
  if (status >= 500) return 'text-destructive'
  if (status >= 400) return 'text-orange-400'
  if (status >= 300) return 'text-muted-foreground'
  return 'text-success'
}

export function AdminLogsPage() {
  const [userId, setUserId] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [eventType, setEventType] = useState('')
  const [statusCode, setStatusCode] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const pageSize = 50

  // Debounced so typing in any filter field doesn't fire a request per
  // keystroke — same pattern used by the Groups public search.
  useEffect(() => {
    const handle = setTimeout(() => {
      adminApi
        .listLogs({
          userId: userId || undefined,
          endpoint: endpoint || undefined,
          eventType: eventType || undefined,
          statusCode: statusCode ? Number(statusCode) : undefined,
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
    }, 300)
    return () => clearTimeout(handle)
  }, [userId, endpoint, eventType, statusCode, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Logs</h2>
        <p className="text-sm text-muted-foreground">{total} eventos registrados</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Filtrar por endpoint"
          value={endpoint}
          onChange={(event) => {
            setPage(1)
            setEndpoint(event.target.value)
          }}
          className="w-48"
        />
        <Input
          placeholder="Tipo de evento"
          value={eventType}
          onChange={(event) => {
            setPage(1)
            setEventType(event.target.value)
          }}
          className="w-44"
        />
        <Input
          placeholder="Status HTTP"
          value={statusCode}
          onChange={(event) => {
            setPage(1)
            setStatusCode(event.target.value)
          }}
          className="w-28"
        />
        <Input
          placeholder="ID do usuário"
          value={userId}
          onChange={(event) => {
            setPage(1)
            setUserId(event.target.value)
          }}
          className="w-56"
        />
      </div>

      <Card className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Data/Hora</th>
              <th className="px-4 py-2 font-medium">Método</th>
              <th className="px-4 py-2 font-medium">Endpoint</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Tempo</th>
              <th className="px-4 py-2 font-medium">Evento</th>
              <th className="px-4 py-2 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{log.method}</td>
                <td className="px-4 py-2 font-mono text-xs">{log.endpoint}</td>
                <td className={cn('px-4 py-2 font-mono text-xs', statusColor(log.statusCode))}>
                  {log.statusCode}
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{log.durationMs}ms</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{log.eventType}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{log.ip ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
