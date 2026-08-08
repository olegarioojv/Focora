import type { DailyLogResponse } from '@/services/settings-api'
import { toISODate, addDays } from './date'

export interface DailyStat {
  date: string
  minutes: number
  pomodoros: number
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Builds a continuous list of the last `days` calendar days (oldest to
 * newest, today included), filling any day without a real log with
 * zeroed stats — so charts/heatmaps show true gaps instead of just the
 * sparse days that happen to have data. */
export function fillDailyStats(
  logs: DailyLogResponse[],
  days: number,
): DailyStat[] {
  const byDate = new Map(logs.map((log) => [log.date, log]))
  const today = new Date()

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, -(days - 1 - index))
    const iso = toISODate(date)
    const log = byDate.get(iso)
    return {
      date: iso,
      minutes: log?.minutes ?? 0,
      pomodoros: log?.pomodoros ?? 0,
    }
  })
}

export function getWeeklyChartData(daily: DailyStat[]) {
  return daily.slice(-7).map((stat) => ({
    label: WEEKDAY_SHORT[new Date(stat.date).getDay()],
    hours: Math.round((stat.minutes / 60) * 10) / 10,
  }))
}

/** One point per challenge day (1 to 100), from the challenge's start
 * date — not the last 30 calendar days — so the chart's x-axis reads as
 * challenge-day progress (0-100) instead of calendar dates. */
export function getChallengeChartData(
  logs: DailyLogResponse[],
  challengeStartDate: string,
) {
  const byDate = new Map(logs.map((log) => [log.date, log]))
  const start = new Date(challengeStartDate)

  return Array.from({ length: 100 }, (_, index) => {
    const iso = toISODate(addDays(start, index))
    const log = byDate.get(iso)
    return {
      day: index + 1,
      date: iso,
      hours: Math.round(((log?.minutes ?? 0) / 60) * 10) / 10,
    }
  })
}

/** Formats an ISO date (yyyy-mm-dd) as dd/mm without going through a JS
 * Date — avoids UTC-parsing shifting the day by one in negative-offset
 * timezones (e.g. "2026-08-01" parsed as UTC midnight renders as 31/07
 * once converted to a local time behind UTC). */
export function formatDayMonth(iso: string) {
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}
