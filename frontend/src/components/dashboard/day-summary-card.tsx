import { CheckCircle2, Circle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { usePlanStore } from '@/stores/plan-store'
import { usePomodoroStore } from '@/stores/pomodoro-store'
import { usePomodoroSettingsStore } from '@/stores/pomodoro-settings-store'
import { getTodayWeekday } from '@/utils/date'

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours}h` : `${hours}h${remainder.toString().padStart(2, '0')}`
}

export function DaySummaryCard() {
  const schedule = usePlanStore((state) => state.schedule)
  const cyclesCompleted = usePomodoroStore((state) => state.cyclesCompleted)
  const dailyGoalPomodoros = usePomodoroSettingsStore(
    (state) => state.dailyGoalPomodoros,
  )

  const today = getTodayWeekday()
  const tasks = schedule?.[today] ?? []

  if (tasks.length === 0) {
    return (
      <Card className="border border-border p-5">
        <p className="text-sm font-medium text-foreground">Resumo do Dia</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Gere seu cronograma no Plano Inteligente para ver o resumo de hoje.
        </p>
      </Card>
    )
  }

  const totalMinutes = tasks.reduce((sum, task) => sum + task.durationMinutes, 0)
  const completedMinutes = tasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + task.durationMinutes, 0)
  const studyDone = completedMinutes >= totalMinutes

  const subjectIds = [...new Set(tasks.map((task) => task.subjectId))]
  const completedSubjectIds = subjectIds.filter((subjectId) =>
    tasks
      .filter((task) => task.subjectId === subjectId)
      .every((task) => task.completed),
  )
  const subjectsDone = completedSubjectIds.length >= subjectIds.length

  const pomodorosDone = cyclesCompleted >= dailyGoalPomodoros

  const summaryItems = [
    {
      label: 'Estudar',
      value: `${formatHours(completedMinutes)} / ${formatHours(totalMinutes)}`,
      done: studyDone,
    },
    {
      label: 'Pomodoros',
      value: `${cyclesCompleted} / ${dailyGoalPomodoros}`,
      done: pomodorosDone,
    },
    {
      label: 'Matérias',
      value: `${completedSubjectIds.length} de ${subjectIds.length}`,
      done: subjectsDone,
    },
  ]

  const goalCompleted = studyDone && pomodorosDone && subjectsDone

  return (
    <Card className="border border-border p-5">
      <p className="text-sm font-medium text-foreground">Resumo do Dia</p>

      <ul className="mt-3 flex flex-col gap-2.5">
        {summaryItems.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {item.value}
              </span>
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
          </li>
        ))}
      </ul>

      {goalCompleted && (
        <p className="mt-3 text-sm font-medium text-success">
          Meta cumprida! 🎉
        </p>
      )}
    </Card>
  )
}
