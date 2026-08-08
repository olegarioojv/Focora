export type CalendarDayStatus = 'completed' | 'missed' | 'today' | 'future'

export interface CalendarDay {
  day: number
  status: CalendarDayStatus
}
