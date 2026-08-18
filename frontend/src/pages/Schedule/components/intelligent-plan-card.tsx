import { useEffect, useState } from 'react'
import { RefreshCw, RotateCcw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import { dayPlanApi } from '@/services/day-plan-api'
import { ApiError } from '@/services/api-client'
import { WEEKDAYS } from '@/types/plan'
import type { DayPlanCategory, DayPlanConfig } from '@/types/day-plan'
import { DayPlanConfigCard } from './day-plan-config-card'

const CATEGORIES: DayPlanCategory[] = ['Estudos', 'Revisão']

interface IntelligentPlanCardProps {
  /** Skips the outer Card chrome and title — for embedding inside a modal
   * that already provides its own container and heading. */
  bare?: boolean
}

export function IntelligentPlanCard({ bare = false }: IntelligentPlanCardProps) {
  const objective = usePlanStore((state) => state.objective)
  const schedule = usePlanStore((state) => state.schedule)
  const setObjective = usePlanStore((state) => state.setObjective)
  const generateSchedule = usePlanStore((state) => state.generateSchedule)
  const subjects = useSubjectsStore((state) => state.subjects)

  const [configTab, setConfigTab] = useState<DayPlanCategory>('Estudos')
  const [configs, setConfigs] = useState<DayPlanConfig[]>([])
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    setLoadingConfigs(true)
    dayPlanApi
      .listConfigs()
      .then(setConfigs)
      .catch((error) =>
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar a configuração do cronograma',
        ),
      )
      .finally(() => setLoadingConfigs(false))
  }, [])

  function handleCardSaved(saved: DayPlanConfig) {
    setConfigs((prev) => {
      const index = prev.findIndex(
        (item) => item.weekday === saved.weekday && item.category === saved.category,
      )
      if (index === -1) return [...prev, saved]
      const next = [...prev]
      next[index] = saved
      return next
    })
  }

  async function handleGenerate() {
    if (subjects.length === 0) {
      toast.error('Cadastre ao menos uma matéria antes de gerar o cronograma')
      return
    }

    setGenerating(true)
    try {
      // Refetch first — a day's config may have been auto-saved after this
      // component's initial load and this is the only way to be sure we're
      // filling gaps against what's actually on the server right now.
      const freshConfigs = await dayPlanApi.listConfigs()
      setConfigs(freshConfigs)

      // Fill only the gaps: a day where you set "quantas matérias" but
      // didn't manually pick all of them gets the remaining slots filled
      // with random subjects. Days you configured fully by hand are left
      // untouched — manual and automatic coexist per day.
      const fillTasks: Promise<unknown>[] = []
      for (const weekday of WEEKDAYS) {
        for (const category of CATEGORIES) {
          const config = freshConfigs.find(
            (item) => item.weekday === weekday && item.category === category,
          )
          const subjectCount = config?.subjectCount ?? 0
          const currentEntries = config?.entries ?? []
          const missing = subjectCount - currentEntries.length
          if (missing <= 0) continue

          const selectedIds = new Set(currentEntries.map((entry) => entry.subjectId))
          const candidates = subjects
            .filter((subject) => !selectedIds.has(subject.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, missing)
          if (candidates.length === 0) continue

          fillTasks.push(
            dayPlanApi.upsertConfig(weekday, category, {
              subjectCount,
              entries: [
                ...currentEntries,
                ...candidates.map((subject) => ({
                  subjectId: subject.id,
                  durationMinutes: 60,
                  repetitions: 1,
                })),
              ],
            }),
          )
        }
      }

      if (fillTasks.length > 0) {
        await Promise.all(fillTasks)
        setConfigs(await dayPlanApi.listConfigs())
      }

      generateSchedule()
      toast.success(schedule ? 'Cronograma recalculado' : 'Cronograma gerado')
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível gerar o cronograma',
      )
    } finally {
      setGenerating(false)
    }
  }

  async function handleResetAll() {
    const confirmed = window.confirm(
      'Isso apaga a configuração de matérias e revisões de todos os dias da semana. Quer continuar?',
    )
    if (!confirmed) return

    setResetting(true)
    try {
      await Promise.all(
        WEEKDAYS.flatMap((weekday) =>
          CATEGORIES.map((category) =>
            dayPlanApi.upsertConfig(weekday, category, {
              subjectCount: 0,
              entries: [],
            }),
          ),
        ),
      )
      setConfigs([])
      toast.success('Cronograma resetado do zero')
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível resetar',
      )
    } finally {
      setResetting(false)
    }
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

      <div className={cn('min-w-0', !bare && 'mt-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={configTab === 'Estudos' ? 'default' : 'outline'}
              onClick={() => setConfigTab('Estudos')}
            >
              Matéria
            </Button>
            <Button
              type="button"
              size="sm"
              variant={configTab === 'Revisão' ? 'default' : 'outline'}
              onClick={() => setConfigTab('Revisão')}
            >
              Revisão
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={resetting}
            onClick={() => void handleResetAll()}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resetar do zero
          </Button>
        </div>

        <div className="mt-3 flex min-w-0 gap-3 overflow-x-auto pb-2">
          {loadingConfigs ? (
            <p className="text-xs text-muted-foreground">Carregando…</p>
          ) : (
            WEEKDAYS.map((weekday) => (
              <DayPlanConfigCard
                key={`${weekday}-${configTab}`}
                weekday={weekday}
                category={configTab}
                subjects={subjects}
                initialConfig={configs.find(
                  (config) =>
                    config.weekday === weekday && config.category === configTab,
                )}
                onSaved={handleCardSaved}
              />
            ))
          )}
        </div>
      </div>

      <Button
        type="button"
        className="mt-5"
        disabled={generating}
        onClick={() => void handleGenerate()}
      >
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
