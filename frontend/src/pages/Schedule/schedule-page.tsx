import { Link } from 'react-router-dom'
import { ArrowLeft, Brain } from 'lucide-react'
import { IntelligentPlanCard } from './components/intelligent-plan-card'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export function SchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          to="/app"
          className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Início
        </Link>

        <Link
          to="/app/brain"
          title="Segundo Cérebro"
          aria-label="Abrir Segundo Cérebro"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Brain className="h-3.5 w-3.5" />
          Segundo Cérebro
        </Link>
      </div>

      <IntelligentPlanCard />
      <KanbanBoard />
    </div>
  )
}
