export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export type WeeklyAvailability = Record<Weekday, number>

export interface ScheduleTask {
  id: string
  subjectId: string
  type: 'Estudos' | 'Revisão'
  durationMinutes: number
  completed: boolean
}

export type WeeklySchedule = Record<Weekday, ScheduleTask[]>

export interface NewTaskInput {
  subjectId: string
  type: ScheduleTask['type']
  durationMinutes: number
}
