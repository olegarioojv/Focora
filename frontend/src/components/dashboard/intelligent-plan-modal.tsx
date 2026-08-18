import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { IntelligentPlanCard } from '@/pages/Schedule/components/intelligent-plan-card'

interface IntelligentPlanModalProps {
  trigger: ReactNode
}

export function IntelligentPlanModal({ trigger }: IntelligentPlanModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Plano Inteligente</DialogTitle>
        </DialogHeader>
        <IntelligentPlanCard bare />
      </DialogContent>
    </Dialog>
  )
}
