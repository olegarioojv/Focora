import { WEEKDAYS, type Weekday } from '@/types/plan'

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayISODate(): string {
  return toISODate(new Date())
}

const JS_DAY_TO_WEEKDAY: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export function getTodayWeekday(): Weekday {
  return JS_DAY_TO_WEEKDAY[new Date().getDay()]
}

export function getCurrentWeekStart(): Date {
  const today = new Date()
  const jsDay = today.getDay()
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  return addDays(today, mondayOffset)
}

export function getCurrentWeekStartISO(): string {
  return toISODate(getCurrentWeekStart())
}

export function getCurrentWeekDates(): Record<Weekday, Date> {
  const monday = getCurrentWeekStart()

  const dates = {} as Record<Weekday, Date>
  WEEKDAYS.forEach((weekday, index) => {
    dates[weekday] = addDays(monday, index)
  })
  return dates
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** Formats an ISO date (yyyy-mm-dd) as dd/mm/yyyy without going through a
 * JS Date — `new Date('yyyy-mm-dd')` parses as UTC midnight, which renders
 * one day early once converted to any timezone behind UTC (Brazil
 * included). Same fix already applied in utils/daily-logs.ts's
 * formatDayMonth for the same reason. */
export function formatFullDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}
