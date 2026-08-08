import { useEffect } from 'react'
import { usePomodoroStore } from '@/stores/pomodoro-store'

export function usePomodoroTimer() {
  const isRunning = usePomodoroStore((state) => state.isRunning)
  const tick = usePomodoroStore((state) => state.tick)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, tick])
}
