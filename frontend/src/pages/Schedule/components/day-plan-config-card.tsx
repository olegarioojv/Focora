import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { dayPlanApi } from '@/services/day-plan-api'
import { ApiError } from '@/services/api-client'
import { WEEKDAY_LABELS } from '@/utils/weekday-labels'
import type { DayPlanCategory, DayPlanConfig } from '@/types/day-plan'
import type { Weekday } from '@/types/plan'
import type { Subject } from '@/types/subject'

interface EntryState {
  durationMinutes: number
  repetitions: number
}

interface DayPlanConfigCardProps {
  weekday: Weekday
  category: DayPlanCategory
  subjects: Subject[]
  initialConfig?: DayPlanConfig
  /** Called right after a successful save, so the parent's copy of the
   * configs (used when generating the schedule) never goes stale. */
  onSaved?: (config: DayPlanConfig) => void
}

function buildEntriesMap(config?: DayPlanConfig): Record<string, EntryState> {
  const map: Record<string, EntryState> = {}
  config?.entries.forEach((entry) => {
    map[entry.subjectId] = {
      durationMinutes: entry.durationMinutes,
      repetitions: entry.repetitions,
    }
  })
  return map
}

export function DayPlanConfigCard({
  weekday,
  category,
  subjects,
  initialConfig,
  onSaved,
}: DayPlanConfigCardProps) {
  const [subjectCount, setSubjectCount] = useState(initialConfig?.subjectCount ?? 0)
  const [entries, setEntries] = useState<Record<string, EntryState>>(() =>
    buildEntriesMap(initialConfig),
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    setSubjectCount(initialConfig?.subjectCount ?? 0)
    setEntries(buildEntriesMap(initialConfig))
  }, [initialConfig])

  const selectedIds = Object.keys(entries)
  const dayLabel = WEEKDAY_LABELS[weekday]

  async function persist(count: number, nextEntries: Record<string, EntryState>) {
    setStatus('saving')
    const entries = Object.keys(nextEntries).map((subjectId) => ({
      subjectId,
      ...nextEntries[subjectId],
    }))
    try {
      await dayPlanApi.upsertConfig(weekday, category, {
        subjectCount: count,
        entries,
      })
      setStatus('saved')
      onSaved?.({ weekday, category, subjectCount: count, entries })
    } catch (error) {
      setStatus('idle')
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível salvar',
      )
    }
  }

  function toggleSubject(subjectId: string) {
    if (entries[subjectId]) {
      const next = { ...entries }
      delete next[subjectId]
      setEntries(next)
      void persist(subjectCount, next)
      return
    }
    if (selectedIds.length >= subjectCount) {
      toast.error(
        subjectCount === 0
          ? `Defina quantas matérias quer estudar em ${dayLabel} primeiro`
          : `Limite de ${subjectCount} matéria(s) atingido em ${dayLabel}`,
      )
      return
    }
    const next = { ...entries, [subjectId]: { durationMinutes: 60, repetitions: 1 } }
    setEntries(next)
    void persist(subjectCount, next)
  }

  function updateEntry(subjectId: string, patch: Partial<EntryState>) {
    setEntries({ ...entries, [subjectId]: { ...entries[subjectId], ...patch } })
  }

  return (
    <div className="flex h-72 w-64 shrink-0 flex-col rounded-lg border border-border p-4">
      <span className="shrink-0 text-sm font-medium text-foreground">
        {dayLabel}
      </span>
      <div className="mt-2 flex shrink-0 items-center gap-2">
        <label
          className="text-xs text-muted-foreground"
          htmlFor={`${weekday}-${category}-count`}
        >
          Matérias por dia
        </label>
        <Input
          id={`${weekday}-${category}-count`}
          type="number"
          min={0}
          value={subjectCount}
          onChange={(event) =>
            setSubjectCount(Math.max(0, Number(event.target.value) || 0))
          }
          onBlur={() => void persist(subjectCount, entries)}
          className="h-8 w-16"
        />
      </div>

      {subjects.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Cadastre matérias primeiro.
        </p>
      ) : (
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {subjects.map((subject) => {
              const entry = entries[subject.id]
              const selected = Boolean(entry)
              return (
                <div key={subject.id} className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <span className="truncate">{subject.name}</span>
                  </label>
                  {selected && entry && (
                    <div className="flex items-center gap-1.5 pl-6">
                      <Input
                        type="number"
                        min={1}
                        value={entry.durationMinutes}
                        onChange={(event) =>
                          updateEntry(subject.id, {
                            durationMinutes: Math.max(
                              1,
                              Number(event.target.value) || 1,
                            ),
                          })
                        }
                        onBlur={() => void persist(subjectCount, entries)}
                        className="h-8 w-16"
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                      <Input
                        type="number"
                        min={1}
                        value={entry.repetitions}
                        onChange={(event) =>
                          updateEntry(subject.id, {
                            repetitions: Math.max(1, Number(event.target.value) || 1),
                          })
                        }
                        onBlur={() => void persist(subjectCount, entries)}
                        className="h-8 w-14"
                      />
                      <span className="text-xs text-muted-foreground">×</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {selectedIds.length} / {subjectCount} matérias selecionadas
        </span>
        <span className="text-xs text-muted-foreground">
          {status === 'saving' && 'Salvando…'}
          {status === 'saved' && 'Salvo ✓'}
        </span>
      </div>
    </div>
  )
}
