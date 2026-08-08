import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriorityStarsProps {
  value: number
  onChange?: (value: number) => void
  size?: number
}

export function PriorityStars({ value, onChange, size = 14 }: PriorityStarsProps) {
  const interactive = Boolean(onChange)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(!interactive && 'cursor-default')}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-muted-foreground',
            )}
          />
        </button>
      ))}
    </div>
  )
}
