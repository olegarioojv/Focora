import type { Subject } from '@/types/subject'
import type {
  ScheduleTask,
  Weekday,
  WeeklyAvailability,
  WeeklySchedule,
} from '@/types/plan'
import { WEEKDAYS } from '@/types/plan'

const BLOCK_MINUTES = 60
const MIN_BLOCK_MINUTES = 30

/** Fisher-Yates shuffle — used so tie-breaks (and thus the final layout)
 * vary between generations instead of always favoring the same subject. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Weighted round-robin: each subject starts with credits equal to its
 * priority (1-5). Every pick drains the highest-credit subject by one;
 * once all subjects are drained, credits reset. Higher priority subjects
 * end up picked proportionally more often across the week. Subjects are
 * shuffled up front so ties between equal-priority subjects resolve
 * differently on every call, giving each "Recalcular" a fresh layout.
 */
function createSubjectPicker(subjects: Subject[]) {
  const order = shuffle(subjects)
  let credits = order.map((subject) => subject.priority)

  return function pick(): Subject {
    if (credits.every((credit) => credit <= 0)) {
      credits = order.map((subject) => subject.priority)
    }

    let bestIndex = 0
    for (let index = 1; index < credits.length; index += 1) {
      if (credits[index] > credits[bestIndex]) bestIndex = index
    }

    credits[bestIndex] -= 1
    return order[bestIndex]
  }
}

/**
 * Subjects with preferred days are only eligible on those days; subjects
 * with no preference (empty array) are eligible every day. If a day ends
 * up with no eligible subject, every subject becomes eligible for it
 * instead of leaving the day empty.
 */
function eligibleSubjectsForDay(subjects: Subject[], day: Weekday): Subject[] {
  const withPreference = subjects.filter((subject) => {
    const preferredDays = subject.preferredDays ?? []
    return preferredDays.length === 0 || preferredDays.includes(day)
  })
  return withPreference.length > 0 ? withPreference : subjects
}

export function generateWeeklySchedule(
  subjects: Subject[],
  availability: WeeklyAvailability,
): WeeklySchedule {
  const schedule = {} as WeeklySchedule

  if (subjects.length === 0) {
    WEEKDAYS.forEach((day) => {
      schedule[day] = []
    })
    return schedule
  }

  for (const day of WEEKDAYS) {
    let remainingMinutes = Math.round((availability[day] ?? 0) * 60)
    const tasks: ScheduleTask[] = []
    const pick = createSubjectPicker(eligibleSubjectsForDay(subjects, day))

    while (remainingMinutes >= MIN_BLOCK_MINUTES) {
      const subject = pick()
      const duration = Math.min(BLOCK_MINUTES, remainingMinutes)
      tasks.push({
        id: crypto.randomUUID(),
        subjectId: subject.id,
        type: 'Estudos',
        durationMinutes: duration,
        completed: false,
      })
      remainingMinutes -= duration
    }

    schedule[day] = tasks
  }

  return schedule
}
