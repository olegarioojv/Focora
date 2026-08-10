import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  LayoutDashboard,
  ListTree,
  LogOut,
  Radio,
  ShieldCheck,
  Users,
  Users2,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { resetSyncedStores } from '@/hooks/use-sync-user-data'
import { adminApi } from '@/services/admin-api'

const ALERTS_POLL_MS = 30_000
const ONLINE_POLL_MS = 15_000

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/users', label: 'Usuários', icon: Users },
  { path: '/admin/online', label: 'Online agora', icon: Wifi, badge: 'online' as const },
  { path: '/admin/groups', label: 'Grupos', icon: Users2 },
  { path: '/admin/monitoring', label: 'Monitoramento', icon: Radio },
  { path: '/admin/alerts', label: 'Alertas', icon: Bell, badge: 'alerts' as const },
  { path: '/admin/logs', label: 'Logs', icon: ListTree },
  { path: '/admin/errors', label: 'Erros', icon: AlertTriangle },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const name = useAuthStore((state) => state.user?.name ?? 'Admin')
  const clearSession = useAuthStore((state) => state.clearSession)
  const [openAlerts, setOpenAlerts] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    function poll() {
      adminApi
        .listAlerts()
        .then((alerts) => setOpenAlerts(alerts.filter((a) => !a.resolvedAt).length))
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }
    poll()
    const interval = setInterval(poll, ALERTS_POLL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function poll() {
      adminApi
        .listOnlineUsers()
        .then((users) => setOnlineCount(users.length))
        .catch(() => {
          // Polling — a transient failure just skips this tick.
        })
    }
    poll()
    const interval = setInterval(poll, ONLINE_POLL_MS)
    return () => clearInterval(interval)
  }, [])

  const badgeValues = { alerts: openAlerts, online: onlineCount }

  function handleLogout() {
    clearSession()
    resetSyncedStores()
    navigate('/app')
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Painel Admin
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive &&
                    'bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary',
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
              {item.badge && badgeValues[item.badge] > 0 && (
                <span
                  className={cn(
                    'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium',
                    item.badge === 'alerts'
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-success text-success-foreground',
                  )}
                >
                  {badgeValues[item.badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border p-3">
          <NavLink
            to="/app"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Voltar ao app
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitoramento e gestão da plataforma
            </p>
          </div>
          <span className="text-sm text-muted-foreground">{name}</span>
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto p-6">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
