import { RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { WEEKDAYS } from '@/types/plan'
import { WEEKDAY_SHORT_LABELS } from '@/utils/weekday-labels'

interface IntelligentPlanCardProps {
  /** Skips the outer Card chrome and title — for embedding inside a modal
   * that already provides its own container and heading. */
  bare?: boolean
}

export function IntelligentPlanCard({ bare = false }: IntelligentPlanCardProps) {
  const objective = usePlanStore((state) => state.objective)
  const availability = usePlanStore((state) => state.availability)
  const schedule = usePlanStore((state) => state.schedule)
  const setObjective = usePlanStore((state) => state.setObjective)
  const setAvailability = usePlanStore((state) => state.setAvailability)
  const generateSchedule = usePlanStore((state) => state.generateSchedule)
  const subjects = useSubjectsStore((state) => state.subjects)

  function handleGenerate() {
    if (subjects.length === 0) {
      toast.error('Cadastre ao menos uma matéria antes de gerar o cronograma')
      return
    }
    generateSchedule(subjects)
    toast.success(schedule ? 'Cronograma recalculado' : 'Cronograma gerado')
  }

  const content = (
    <>
      {!bare && (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-medium">
            Plano Inteligente
          </h3>
        </div>
      )}

      {!bare && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="plan-objective"
          >
            Objetivo do desafio
          </label>
          <Input
            id="plan-objective"
            placeholder="Ex: Ser aprovado no concurso X"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
          />
        </div>
      )}

      <div className={cn(!bare && 'mt-4')}>
        <span className="text-sm font-medium text-foreground">
          Disponibilidade semanal (horas por dia)
        </span>
        <div className="mt-2 grid grid-cols-4 gap-3 sm:grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day} className="flex flex-col gap-1">
              <label
                className="text-xs text-muted-foreground"
                htmlFor={`availability-${day}`}
              >
                {WEEKDAY_SHORT_LABELS[day]}
              </label>
              <Input
                id={`availability-${day}`}
                type="number"
                min={0}
                max={12}
                step={0.5}
                value={availability[day]}
                onChange={(event) =>
                  setAvailability(day, Number(event.target.value) || 0)
                }
                className="h-9"
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="button" className="mt-5" onClick={handleGenerate}>
        {schedule ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {schedule ? 'Recalcular cronograma' : 'Gerar cronograma'}
      </Button>
    </>
  )

  if (bare) return content

  return <Card className="border border-border p-6">{content}</Card>
}
