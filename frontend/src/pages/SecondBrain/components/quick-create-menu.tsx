import { Plus, FileText, Sparkles, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface QuickCreateMenuProps {
  onNewNote: () => void
  onNewFlashcard: () => void
  onNewReview: () => void
}

export function QuickCreateMenu({
  onNewNote,
  onNewFlashcard,
  onNewReview,
}: QuickCreateMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="h-4 w-4" />
          Criar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onNewNote}>
          <FileText />
          Nova nota
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onNewFlashcard}>
          <Sparkles />
          Novo flashcard
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onNewReview}>
          <Brain />
          Nova revisão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
