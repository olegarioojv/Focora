const XP_PER_LEVEL = 100

export function getLevelProgress(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  const xpForNextLevel = XP_PER_LEVEL
  const progressPercent = Math.round((xpIntoLevel / xpForNextLevel) * 100)

  return { level, xpIntoLevel, xpForNextLevel, progressPercent }
}
