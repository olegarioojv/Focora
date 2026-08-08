import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification-store'
import { usePomodoroSettingsStore } from './pomodoro-settings-store'
import { sendNotification } from '@/utils/notifications'

export const POMODORO_PRESETS = [25, 50] as const
export const BREAK_MINUTES = 15

type PomodoroMode = 'focus' | 'break'

interface PomodoroState {
  durationMinutes: number
  breakMinutes: number
  mode: PomodoroMode
  secondsLeft: number
  isRunning: boolean
  // Absolute timestamp (ms) the running segment ends at — the source of
  // truth for remaining time. secondsLeft is just its last-rendered
  // projection: setInterval ticks aren't reliable (browsers throttle
  // background tabs), so recomputing from endAt on every tick self-
  // corrects instead of drifting from repeated -1 decrements.
  endAt: number | null
  cyclesCompleted: number
  totalFocusMinutesToday: number
  // "Today" counters only make sense for the calendar day they were
  // earned on — needed now that this store persists across refreshes.
  lastActiveDateKey: string
  setDuration: (minutes: number) => void
  setBreakMinutes: (minutes: number) => void
  start: () => void
  pause: () => void
  skip: () => void
  tick: () => void
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      durationMinutes: 25,
      breakMinutes: BREAK_MINUTES,
      mode: 'focus',
      secondsLeft: 25 * 60,
      isRunning: false,
      endAt: null,
      cyclesCompleted: 0,
      totalFocusMinutesToday: 0,
      lastActiveDateKey: todayKey(),
      setDuration: (minutes) =>
        set((state) =>
          state.mode === 'focus'
            ? {
                durationMinutes: minutes,
                secondsLeft: minutes * 60,
                isRunning: false,
                endAt: null,
              }
            : { durationMinutes: minutes },
        ),
      setBreakMinutes: (minutes) =>
        set((state) =>
          state.mode === 'break'
            ? {
                breakMinutes: minutes,
                secondsLeft: minutes * 60,
                isRunning: false,
                endAt: null,
              }
            : { breakMinutes: minutes },
        ),
      start: () =>
        set((state) => ({
          isRunning: true,
          endAt: Date.now() + state.secondsLeft * 1000,
        })),
      pause: () =>
        set((state) => ({
          isRunning: false,
          secondsLeft: state.endAt
            ? Math.max(0, Math.round((state.endAt - Date.now()) / 1000))
            : state.secondsLeft,
          endAt: null,
        })),
      skip: () =>
        set((state) => {
          const next =
            state.mode === 'focus'
              ? { mode: 'break' as const, secondsLeft: state.breakMinutes * 60 }
              : { mode: 'focus' as const, secondsLeft: state.durationMinutes * 60 }
          return {
            ...next,
            endAt: state.isRunning ? Date.now() + next.secondsLeft * 1000 : null,
          }
        }),
      tick: () =>
        set((state) => {
          if (!state.isRunning || !state.endAt) return state

          const remaining = Math.round((state.endAt - Date.now()) / 1000)
          if (remaining > 0) return { secondsLeft: remaining }

          const dateKey = todayKey()
          const isNewDay = dateKey !== state.lastActiveDateKey

          if (state.mode === 'focus') {
            useGamificationStore.getState().addPomodoroXP(state.durationMinutes)
            if (usePomodoroSettingsStore.getState().notifyOnComplete) {
              sendNotification(
                'Pomodoro concluído — Focora',
                `Ciclo de foco finalizado. Hora de ${state.breakMinutes} min de descanso!`,
              )
            }
            return {
              mode: 'break',
              secondsLeft: state.breakMinutes * 60,
              endAt: Date.now() + state.breakMinutes * 60 * 1000,
              isRunning: true,
              cyclesCompleted: isNewDay ? 1 : state.cyclesCompleted + 1,
              totalFocusMinutesToday: isNewDay
                ? state.durationMinutes
                : state.totalFocusMinutesToday + state.durationMinutes,
              lastActiveDateKey: dateKey,
            }
          }

          if (usePomodoroSettingsStore.getState().notifyOnComplete) {
            sendNotification(
              'Descanso concluído — Focora',
              'Hora de voltar ao foco!',
            )
          }
          return {
            mode: 'focus',
            secondsLeft: state.durationMinutes * 60,
            endAt: null,
            isRunning: false,
            cyclesCompleted: isNewDay ? 0 : state.cyclesCompleted,
            totalFocusMinutesToday: isNewDay ? 0 : state.totalFocusMinutesToday,
            lastActiveDateKey: isNewDay ? dateKey : state.lastActiveDateKey,
          }
        }),
    }),
    {
      name: 'focora-pomodoro',
      // Corrects drift/staleness accumulated while the tab was closed or
      // backgrounded, and resets "today" counters if the calendar day
      // rolled over — before the first render, not after a 1s tick delay.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const dateKey = todayKey()
        if (state.lastActiveDateKey !== dateKey) {
          state.cyclesCompleted = 0
          state.totalFocusMinutesToday = 0
          state.lastActiveDateKey = dateKey
        }
        if (state.isRunning && state.endAt) {
          state.secondsLeft = Math.max(
            0,
            Math.round((state.endAt - Date.now()) / 1000),
          )
        }
      },
    },
  ),
)
