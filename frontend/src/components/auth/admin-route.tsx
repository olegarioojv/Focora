import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

export function AdminRoute() {
  const role = useAuthStore((state) => state.user?.role)

  if (role !== 'admin') return <Navigate to="/app" replace />

  return <Outlet />
}
