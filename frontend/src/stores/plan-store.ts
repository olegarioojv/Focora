import { create } from 'zustand'
import { toast } from 'sonner'
import type { NewTaskInput, Weekday, WeeklySchedule } from '@/types/plan'
import { WEEKDAYS } from '@/types/plan'
import type { StudySession } from '@/types/day-plan'
import { dayPlanApi } from '@/services/day-plan-api'
import { planApi, type PlanResponse } from '@/services/plan-api'
import { ApiError } from '@/services/api-client'
import { getCurrentWeekStartISO } from '@/utils/date'

interface MoveTaskInput {
  taskId: string
  fromDay: Weekday
  toDay: Weekday
  /** Task id to insert before, or null to append at the end of toDay. */
  overTaskId: string | null
}

interface PlanState {
  objective: string
  schedule: WeeklySchedule | null
  weekStart: string | null
  hydrate: (plan: PlanResponse | null) => void
  setObjective: (objective: string) => void
  generateSchedule: () => void
  moveTask: (input: MoveTaskInput) => void
  toggleTaskCompleted: (day: Weekday, taskId: string) => void
  addTask: (day: Weekday, input: NewTaskInput) => void
  removeTask: (day: Weekday, taskId: string) => void
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

function emptySchedule(): WeeklySchedule {
  const schedule = {} as WeeklySchedule
  WEEKDAYS.forEach((day) => {
    schedule[day] = []
  })
  return schedule
}

function groupSessions(sessions: StudySession[]): WeeklySchedule {
  const schedule = emptySchedule()
  for (const session of sessions) {
    schedule[session.weekday].push({
      id: session.id,
      subjectId: session.subjectId,
      type: session.category,
      durationMinutes: session.durationMinutes,
      completed: session.completed,
    })
  }
  return schedule
}

export const usePlanStore = create<PlanState>()((set, get) => ({
  objective: '',
  schedule: null,
  weekStart: null,
  hydrate: (plan) => {
    if (!plan) {
      set({ objective: '', schedule: null, weekStart: null })
      return
    }

    const currentWeekStart = getCurrentWeekStartISO()
    set({ objective: plan.objective })

    if (plan.weekStart !== currentWeekStart) {
      set({ weekStart: currentWeekStart })
      planApi
        .update({ weekStart: currentWeekStart })
        .catch((error) =>
          reportError(error, 'Não foi possível salvar a semana atual'),
        )
      dayPlanApi
        .sync(currentWeekStart)
        .then((sessions) => set({ schedule: groupSessions(sessions) }))
        .catch((error) =>
          reportError(error, 'Não foi possível atualizar o cronograma da semana'),
        )
      return
    }

    set({ weekStart: plan.weekStart })
    dayPlanApi
      .listSessions(currentWeekStart)
      .then((sessions) => set({ schedule: groupSessions(sessions) }))
      .catch((error) =>
        reportError(error, 'Não foi possível carregar o cronograma'),
      )
  },
  setObjective: (objective) => {
    set({ objective })
    planApi
      .update({ objective })
      .catch((error) => reportError(error, 'Não foi possível salvar o objetivo'))
  },
  generateSchedule: () => {
    const weekStart = getCurrentWeekStartISO()
    set({ weekStart })
    planApi.update({ weekStart }).catch(() => {})
    dayPlanApi
      .sync(weekStart)
      .then((sessions) => set({ schedule: groupSessions(sessions) }))
      .catch((error) => reportError(error, 'Não foi possível gerar o cronograma'))
  },
  moveTask: ({ taskId, fromDay, toDay, overTaskId }) => {
    const { schedule } = get()
    if (!schedule) return

    const fromTasks = [...schedule[fromDay]]
    const taskIndex = fromTasks.findIndex((task) => task.id === taskId)
    if (taskIndex === -1) return

    const [task] = fromTasks.splice(taskIndex, 1)
    const toTasks = fromDay === toDay ? fromTasks : [...schedule[toDay]]

    let insertIndex = toTasks.length
    if (overTaskId) {
      const overIndex = toTasks.findIndex((item) => item.id === overTaskId)
      if (overIndex !== -1) insertIndex = overIndex
    }
    toTasks.splice(insertIndex, 0, task)

    const nextSchedule = { ...schedule, [fromDay]: fromTasks, [toDay]: toTasks }
    set({ schedule: nextSchedule })

    const changes =
      fromDay === toDay
        ? [{ weekday: toDay, orderedIds: toTasks.map((item) => item.id) }]
        : [
            { weekday: fromDay, orderedIds: fromTasks.map((item) => item.id) },
            { weekday: toDay, orderedIds: toTasks.map((item) => item.id) },
          ]

    dayPlanApi.reorder(changes).catch((error) => {
      set({ schedule })
      reportError(error, 'Não foi possível mover a tarefa')
    })
  },
  toggleTaskCompleted: (day, taskId) => {
    const { schedule } = get()
    if (!schedule) return
    const task = schedule[day].find((item) => item.id === taskId)
    if (!task) return
    const nextCompleted = !task.completed

    const nextSchedule = {
      ...schedule,
      [day]: schedule[day].map((item) =>
        item.id === taskId ? { ...item, completed: nextCompleted } : item,
      ),
    }
    set({ schedule: nextSchedule })

    dayPlanApi.updateSession(taskId, nextCompleted).catch((error) => {
      set({ schedule })
      reportError(error, 'Não foi possível salvar a tarefa')
    })
  },
  addTask: (day, input) => {
    const { schedule, weekStart } = get()
    if (!schedule || !weekStart) return

    const tempId = crypto.randomUUID()
    const nextSchedule = {
      ...schedule,
      [day]: [
        ...schedule[day],
        {
          id: tempId,
          subjectId: input.subjectId,
          type: input.type,
          durationMinutes: input.durationMinutes,
          completed: false,
        },
      ],
    }
    set({ schedule: nextSchedule })

    dayPlanApi
      .createSession({
        subjectId: input.subjectId,
        category: input.type,
        weekday: day,
        durationMinutes: input.durationMinutes,
        weekStart,
      })
      .then((session) => {
        set((state) => {
          if (!state.schedule) return state
          return {
            schedule: {
              ...state.schedule,
              [day]: state.schedule[day].map((item) =>
                item.id === tempId
                  ? {
                      id: session.id,
                      subjectId: session.subjectId,
                      type: session.category,
                      durationMinutes: session.durationMinutes,
                      completed: session.completed,
                    }
                  : item,
              ),
            },
          }
        })
      })
      .catch((error) => {
        set({ schedule })
        reportError(error, 'Não foi possível adicionar a tarefa')
      })
  },
  removeTask: (day, taskId) => {
    const { schedule } = get()
    if (!schedule) return

    const nextSchedule = {
      ...schedule,
      [day]: schedule[day].filter((task) => task.id !== taskId),
    }
    set({ schedule: nextSchedule })

    dayPlanApi.removeSession(taskId).catch((error) => {
      set({ schedule })
      reportError(error, 'Não foi possível remover a tarefa')
    })
  },
}))
