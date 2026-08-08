import { useDroppable } from '@dnd-kit/core'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const TRASH_DROPPABLE_ID = 'trash'

interface TrashDropZoneProps {
  visible: boolean
}

export function TrashDropZone({ visible }: TrashDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: TRASH_DROPPABLE_ID })

  if (!visible) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-dashed px-5 py-3 text-sm font-medium shadow-lg transition-colors',
        isOver
          ? 'scale-110 border-destructive bg-destructive text-destructive-foreground'
          : 'border-destructive/50 bg-popover text-destructive',
      )}
    >
      <Trash2 className="h-4 w-4" />
      Soltar aqui para remover
    </div>
  )
}
