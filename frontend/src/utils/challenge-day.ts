/** Full calendar days elapsed since the challenge started (0 on the day
 * the account was created). Used to derive "days completed" for the
 * progress card and which calendar cell is "today". */
export function getChallengeDayNumber(challengeStartDate: string) {
  const start = new Date(challengeStartDate)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysElapsed = Math.round(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, daysElapsed)
}
