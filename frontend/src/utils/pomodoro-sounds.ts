// Every sound is synthesized with the Web Audio API instead of shipped as
// an audio file — no licensing to worry about, zero bundle weight, and
// previews play with no network round-trip. Each entry is a short list of
// notes (frequency, when to start, how long, waveform, peak volume); the
// player schedules them all as tiny oscillator + gain-envelope pairs.

export type Waveform = 'sine' | 'square' | 'triangle' | 'sawtooth'

interface Note {
  freq: number
  start: number // seconds from the sound's own start
  duration: number
  wave: Waveform
  peak: number // 0-1, this note's own contribution before the user's volume knob
}

export interface SoundPreset {
  key: string
  label: string
  notes: Note[]
}

function note(
  freq: number,
  start: number,
  duration: number,
  wave: Waveform = 'sine',
  peak = 0.5,
): Note {
  return { freq, start, duration, wave, peak }
}

export const SOUND_LIBRARY: SoundPreset[] = [
  {
    key: 'classico',
    label: 'Clássico',
    notes: [note(880, 0, 0.12, 'sine', 0.5), note(880, 0.16, 0.12, 'sine', 0.5)],
  },
  {
    key: 'digital',
    label: 'Digital',
    notes: [
      note(1200, 0, 0.05, 'square', 0.25),
      note(1200, 0.08, 0.05, 'square', 0.25),
      note(1200, 0.16, 0.08, 'square', 0.25),
    ],
  },
  {
    key: 'campainha',
    label: 'Campainha',
    notes: [note(659.25, 0, 0.35, 'sine', 0.5), note(523.25, 0.28, 0.5, 'sine', 0.5)],
  },
  {
    key: 'sino',
    label: 'Sino',
    notes: [
      note(880, 0, 1.1, 'sine', 0.45),
      note(1760, 0, 0.9, 'sine', 0.15),
      note(2637, 0, 0.6, 'sine', 0.08),
    ],
  },
  {
    key: 'suave',
    label: 'Suave',
    notes: [note(523.25, 0, 0.9, 'sine', 0.3)],
  },
  {
    key: 'minimalista',
    label: 'Minimalista',
    notes: [note(1000, 0, 0.06, 'sine', 0.35)],
  },
  {
    key: 'foco',
    label: 'Foco',
    notes: [note(220, 0, 0.5, 'triangle', 0.4), note(330, 0.12, 0.4, 'triangle', 0.25)],
  },
  {
    key: 'natureza',
    label: 'Natureza',
    notes: [
      note(523.25, 0, 0.3, 'sine', 0.3),
      note(659.25, 0.12, 0.3, 'sine', 0.3),
      note(783.99, 0.24, 0.4, 'sine', 0.3),
    ],
  },
]

const soundsByKey = new Map(SOUND_LIBRARY.map((s) => [s.key, s]))

let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedContext) sharedContext = new Ctor()
  return sharedContext
}

/** Plays a preset by key at the given 0-100 volume. Swallows every failure
 * (unsupported browser, autoplay policy not yet unlocked by a user
 * gesture, context creation error) — a sound that fails to play must never
 * break the Pomodoro timer itself. */
export function playPomodoroSound(key: string, volumePercent: number) {
  try {
    const preset = soundsByKey.get(key)
    if (!preset) return
    const ctx = getContext()
    if (!ctx) return

    const volume = Math.min(1, Math.max(0, volumePercent / 100))
    if (volume === 0) return

    if (ctx.state === 'suspended') {
      // Fire-and-forget: if this rejects (still locked by autoplay policy),
      // the notes below simply won't be audible — no error should surface.
      void ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime
    for (const n of preset.notes) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = n.wave
      oscillator.frequency.setValueAtTime(n.freq, now + n.start)

      const peakGain = n.peak * volume
      const startAt = now + n.start
      const endAt = startAt + n.duration
      // Short attack/release envelope — a hard on/off click at 0 volume-change
      // is audible as a pop, this avoids it.
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(peakGain, startAt + Math.min(0.015, n.duration / 3))
      gain.gain.linearRampToValueAtTime(0, endAt)

      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(startAt)
      oscillator.stop(endAt + 0.02)
    }
  } catch {
    // Never let a synthesis error take down the timer.
  }
}
