import type { CalendarDay, CalendarDayStatus } from '@/types/dashboard'
import { getChallengeDayNumber } from './challenge-day'
import { addDays, toISODate } from './date'

export function generateChallengeCalendar(
  totalDays: number,
  challengeStartDate: string,
  activeDates: Set<string>,
): CalendarDay[] {
  const daysElapsed = getChallengeDayNumber(challengeStartDate)
  const todayDay = daysElapsed + 1
  // Zeroed to local midnight, same as getChallengeDayNumber — otherwise
  // the two functions disagree by a day whenever challengeStartDate's
  // timestamp crosses a UTC-day boundary relative to local midnight,
  // offsetting every one of the 100 calendar cells.
  const start = new Date(challengeStartDate)
  start.setHours(0, 0, 0, 0)

  return Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1
    const date = toISODate(addDays(start, index))
    let status: CalendarDayStatus

    if (day === todayDay) status = 'today'
    else if (day > todayDay) status = 'future'
    else status = activeDates.has(date) ? 'completed' : 'missed'

    return { day, status }
  })
}
