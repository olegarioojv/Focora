import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <DashboardContent />
      </div>
      <DashboardSidebar />
    </div>
  )
}
