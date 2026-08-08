import { create } from 'zustand'
import { toast } from 'sonner'
import type {
  NewTaskInput,
  Weekday,
  WeeklyAvailability,
  WeeklySchedule,
} from '@/types/plan'
import type { Subject } from '@/types/subject'
import { generateWeeklySchedule } from '@/utils/generate-weekly-schedule'
import { planApi, type PlanResponse } from '@/services/plan-api'
import { ApiError } from '@/services/api-client'

const defaultAvailability: WeeklyAvailability = {
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 2,
  friday: 2,
  saturday: 1,
  sunday: 1,
}

interface MoveTaskInput {
  taskId: string
  fromDay: Weekday
  toDay: Weekday
  /** Task id to insert before, or null to append at the end of toDay. */
  overTaskId: string | null
}

interface PlanState {
  objective: string
  availability: WeeklyAvailability
  schedule: WeeklySchedule | null
  hydrate: (plan: PlanResponse | null) => void
  setObjective: (objective: string) => void
  setAvailability: (day: Weekday, hours: number) => void
  generateSchedule: (subjects: Subject[]) => void
  moveTask: (input: MoveTaskInput) => void
  toggleTaskCompleted: (day: Weekday, taskId: string) => void
  addTask: (day: Weekday, input: NewTaskInput) => void
  removeTask: (day: Weekday, taskId: string) => void
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

function syncSchedule(schedule: WeeklySchedule | null) {
  planApi
    .update({ schedule })
    .catch((error) => reportError(error, 'Não foi possível salvar o cronograma'))
}

export const usePlanStore = create<PlanState>()((set, get) => ({
  objective: '',
  availability: defaultAvailability,
  schedule: null,
  hydrate: (plan) =>
    set({
      objective: plan?.objective ?? '',
      availability: plan?.availability ?? defaultAvailability,
      schedule: plan?.schedule ?? null,
    }),
  setObjective: (objective) => {
    set({ objective })
    planApi
      .update({ objective })
      .catch((error) => reportError(error, 'Não foi possível salvar o objetivo'))
  },
  setAvailability: (day, hours) => {
    const availability = { ...get().availability, [day]: hours }
    set({ availability })
    planApi
      .update({ availability })
      .catch((error) =>
        reportError(error, 'Não foi possível salvar a disponibilidade'),
      )
  },
  generateSchedule: (subjects) => {
    const schedule = generateWeeklySchedule(subjects, get().availability)
    set({ schedule })
    syncSchedule(schedule)
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
    syncSchedule(nextSchedule)
  },
  toggleTaskCompleted: (day, taskId) => {
    const { schedule } = get()
    if (!schedule) return

    const nextSchedule = {
      ...schedule,
      [day]: schedule[day].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }
    set({ schedule: nextSchedule })
    syncSchedule(nextSchedule)
  },
  addTask: (day, input) => {
    const { schedule } = get()
    if (!schedule) return

    const nextSchedule = {
      ...schedule,
      [day]: [
        ...schedule[day],
        {
          id: crypto.randomUUID(),
          subjectId: input.subjectId,
          type: input.type,
          durationMinutes: input.durationMinutes,
          completed: false,
        },
      ],
    }
    set({ schedule: nextSchedule })
    syncSchedule(nextSchedule)
  },
  removeTask: (day, taskId) => {
    const { schedule } = get()
    if (!schedule) return

    const nextSchedule = {
      ...schedule,
      [day]: schedule[day].filter((task) => task.id !== taskId),
    }
    set({ schedule: nextSchedule })
    syncSchedule(nextSchedule)
  },
}))
