import { useEffect } from 'react'
import { Bell, Pause, Play, SkipForward } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { POMODORO_PRESETS, usePomodoroStore } from '@/stores/pomodoro-store'
import { usePomodoroSettingsStore } from '@/stores/pomodoro-settings-store'
import {
  isNotificationSupported,
  requestNotificationPermission,
} from '@/utils/notifications'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function formatHoursMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

export function PomodoroCard() {
  const durationMinutes = usePomodoroStore((state) => state.durationMinutes)
  const breakMinutes = usePomodoroStore((state) => state.breakMinutes)
  const mode = usePomodoroStore((state) => state.mode)
  const secondsLeft = usePomodoroStore((state) => state.secondsLeft)
  const isRunning = usePomodoroStore((state) => state.isRunning)
  const cyclesCompleted = usePomodoroStore((state) => state.cyclesCompleted)
  const totalFocusMinutesToday = usePomodoroStore(
    (state) => state.totalFocusMinutesToday,
  )
  const setDuration = usePomodoroStore((state) => state.setDuration)
  const setBreakMinutes = usePomodoroStore((state) => state.setBreakMinutes)
  const start = usePomodoroStore((state) => state.start)
  const pause = usePomodoroStore((state) => state.pause)
  const skip = usePomodoroStore((state) => state.skip)

  const defaultDurationMinutes = usePomodoroSettingsStore(
    (state) => state.defaultDurationMinutes,
  )
  const defaultBreakMinutes = usePomodoroSettingsStore(
    (state) => state.defaultBreakMinutes,
  )
  const dailyGoalPomodoros = usePomodoroSettingsStore(
    (state) => state.dailyGoalPomodoros,
  )
  const notifyOnComplete = usePomodoroSettingsStore(
    (state) => state.notifyOnComplete,
  )
  const setNotifyOnComplete = usePomodoroSettingsStore(
    (state) => state.setNotifyOnComplete,
  )

  // Re-applies the configured defaults whenever they change (mount included),
  // as long as the timer hasn't started yet — never fights a live session.
  useEffect(() => {
    if (!isRunning) {
      setDuration(defaultDurationMinutes)
      setBreakMinutes(defaultBreakMinutes)
    }
  }, [defaultDurationMinutes, defaultBreakMinutes])

  const totalSeconds =
    (mode === 'focus' ? durationMinutes : breakMinutes) * 60
  const progress = 1 - secondsLeft / totalSeconds
  const circumference = 2 * Math.PI * 45
  const goalProgress = Math.min(
    100,
    (cyclesCompleted / dailyGoalPomodoros) * 100,
  )

  function handlePreset(minutes: number) {
    setDuration(minutes)
  }

  async function handleNotifyToggle() {
    const nextValue = !notifyOnComplete
    if (nextValue && isNotificationSupported() && Notification.permission !== 'granted') {
      const result = await requestNotificationPermission()
      if (result !== 'granted') {
        toast.error('Permissão de notificações negada')
        return
      }
      toast.success('Notificações ativadas')
    }
    setNotifyOnComplete(nextValue)
  }

  return (
    <Card className="border border-border p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Pomodoro – Hoje</p>
        <button
          type="button"
          onClick={() => void handleNotifyToggle()}
          aria-pressed={notifyOnComplete}
          aria-label="Notificar ao concluir um ciclo do Pomodoro"
          title="Notificar ao concluir um ciclo"
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
            notifyOnComplete
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Bell className="h-4 w-4" fill={notifyOnComplete ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {POMODORO_PRESETS.map((minutes) => (
          <Button
            key={minutes}
            type="button"
            size="sm"
            variant={durationMinutes === minutes ? 'default' : 'outline'}
            onClick={() => handlePreset(minutes)}
            disabled={isRunning}
          >
            {minutes} min
          </Button>
        ))}
      </div>

      <div className="relative mx-auto mt-6 flex h-40 w-40 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="6"
            className={cn(
              'fill-none',
              mode === 'focus' ? 'stroke-red-500/20' : 'stroke-success/20',
            )}
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className={cn(
              'fill-none transition-[stroke-dashoffset] duration-500 ease-linear',
              mode === 'focus' ? 'stroke-red-500' : 'stroke-success',
            )}
          />
        </svg>
        <div className="flex flex-col items-center">
          <img src="/tomate.webp" alt="" className="mb-1 h-8 w-8" />
          <span className="text-3xl font-semibold text-foreground">
            {formatTime(secondsLeft)}
          </span>
          <span
            className={cn(
              'text-xs font-medium',
              mode === 'focus' ? 'text-red-500' : 'text-success',
            )}
          >
            {mode === 'focus' ? 'Foco' : 'Descanso'}
          </span>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        Ciclos hoje:{' '}
        <span className="font-medium text-foreground">{cyclesCompleted}</span>
        <img src="/tomate.webp" alt="" className="h-3.5 w-3.5" />
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {isRunning ? (
          <Button
            type="button"
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={pause}
          >
            <Pause className="h-4 w-4" />
            Pausar
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={start}
          >
            <Play className="h-4 w-4" />
            Iniciar
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={skip}>
          <SkipForward className="h-4 w-4" />
          Pular
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tempo total de estudo</span>
          <span className="font-medium text-foreground">
            {formatHoursMinutes(totalFocusMinutesToday)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pomodoros concluídos</span>
          <span className="font-medium text-foreground">
            {cyclesCompleted}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Metas do dia</span>
          <span className="font-medium text-foreground">
            {cyclesCompleted}/{dailyGoalPomodoros}
          </span>
        </div>
        <Progress value={goalProgress} className="mt-1 h-1.5" />
      </div>
    </Card>
  )
}
