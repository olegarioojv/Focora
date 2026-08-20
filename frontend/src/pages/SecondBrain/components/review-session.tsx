import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFlashcardsStore } from '@/stores/flashcards-store'
import type { Flashcard, FlashcardRating } from '@/types/flashcard'

interface ReviewSessionProps {
  queue: Flashcard[]
  onComplete: () => void
}

const RATING_OPTIONS: {
  rating: FlashcardRating
  label: string
  className: string
}[] = [
  {
    rating: 'again',
    label: 'Errei',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  },
  {
    rating: 'hard',
    label: 'Difícil',
    className: 'bg-warning/10 text-warning hover:bg-warning/20',
  },
  {
    rating: 'good',
    label: 'Bom',
    className: 'bg-primary text-primary-foreground hover:bg-primary/80',
  },
  {
    rating: 'easy',
    label: 'Fácil',
    className: 'bg-success/10 text-success hover:bg-success/20',
  },
]

export function ReviewSession({ queue, onComplete }: ReviewSessionProps) {
  const reviewFlashcard = useFlashcardsStore((state) => state.reviewFlashcard)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (queue.length === 0) {
      onComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (queue.length === 0) {
    return null
  }

  const currentCard = queue[currentIndex]

  async function handleRate(rating: FlashcardRating) {
    if (submitting) return
    setSubmitting(true)
    try {
      await reviewFlashcard(currentCard.id, rating)
      const nextIndex = currentIndex + 1
      if (nextIndex >= queue.length) {
        onComplete()
        return
      }
      setCurrentIndex(nextIndex)
      setRevealed(false)
    } catch {
      // store already surfaced a toast.error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Cartão {currentIndex + 1} de {queue.length}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Encerrar revisão"
          onClick={onComplete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex min-h-52 flex-col items-center justify-center gap-4 rounded-xl border border-border p-8 text-center">
        <p className="text-base font-medium text-foreground">
          {currentCard.front}
        </p>
        {revealed && (
          <>
            <div className="h-px w-16 bg-border" />
            <p className="text-base text-muted-foreground">{currentCard.back}</p>
          </>
        )}
      </div>

      {!revealed ? (
        <Button type="button" className="self-center" onClick={() => setRevealed(true)}>
          Mostrar resposta
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RATING_OPTIONS.map((option) => (
            <Button
              key={option.rating}
              type="button"
              disabled={submitting}
              className={option.className}
              onClick={() => void handleRate(option.rating)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
