import { BookOpen, History, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type SecondBrainSection = 'notas' | 'flashcards' | 'revisoes'

interface SectionNavProps {
  active: SecondBrainSection
  onChange: (section: SecondBrainSection) => void
}

const ITEMS: {
  id: SecondBrainSection
  label: string
  icon: typeof BookOpen
  badge?: string
}[] = [
  { id: 'notas', label: 'Notas', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, badge: 'Novo' },
  { id: 'revisoes', label: 'Revisões', icon: History },
]

export function SectionNav({ active, onChange }: SectionNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-left text-sm font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge className="rounded-full border-none bg-primary/15 text-primary">
                {item.badge}
              </Badge>
            )}
          </button>
        )
      })}
    </nav>
  )
}
