import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { IntelligentPlanCard } from './components/intelligent-plan-card'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export function SchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/app"
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Início
      </Link>

      <IntelligentPlanCard />
      <KanbanBoard />
    </div>
  )
}
