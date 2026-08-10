import { Play, Volume2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  usePomodoroSettingsStore,
  type PomodoroSoundStage,
} from '@/stores/pomodoro-settings-store'
import { SOUND_LIBRARY, playPomodoroSound } from '@/utils/pomodoro-sounds'

const STAGE_ROWS: { stage: PomodoroSoundStage; label: string }[] = [
  { stage: 'pomodoroFocusStartSound', label: 'Início do foco' },
  { stage: 'pomodoroFocusEndSound', label: 'Finalização do foco' },
  { stage: 'pomodoroBreakStartSound', label: 'Início do descanso' },
  { stage: 'pomodoroBreakEndSound', label: 'Finalização do descanso' },
]

export function PomodoroSoundsSection() {
  const soundsEnabled = usePomodoroSettingsStore(
    (state) => state.pomodoroSoundsEnabled,
  )
  const volume = usePomodoroSettingsStore((state) => state.pomodoroSoundVolume)
  const focusStartSound = usePomodoroSettingsStore(
    (state) => state.pomodoroFocusStartSound,
  )
  const focusEndSound = usePomodoroSettingsStore(
    (state) => state.pomodoroFocusEndSound,
  )
  const breakStartSound = usePomodoroSettingsStore(
    (state) => state.pomodoroBreakStartSound,
  )
  const breakEndSound = usePomodoroSettingsStore(
    (state) => state.pomodoroBreakEndSound,
  )
  const setSoundsEnabled = usePomodoroSettingsStore(
    (state) => state.setPomodoroSoundsEnabled,
  )
  const setVolume = usePomodoroSettingsStore(
    (state) => state.setPomodoroSoundVolume,
  )
  const setStageSound = usePomodoroSettingsStore(
    (state) => state.setPomodoroStageSound,
  )

  const stageSounds: Record<PomodoroSoundStage, string> = {
    pomodoroFocusStartSound: focusStartSound,
    pomodoroFocusEndSound: focusEndSound,
    pomodoroBreakStartSound: breakStartSound,
    pomodoroBreakEndSound: breakEndSound,
  }

  return (
    <Card className="border border-border p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading text-base font-medium">
            Sons do Pomodoro
          </h3>
        </div>
        <Switch
          checked={soundsEnabled}
          onCheckedChange={setSoundsEnabled}
          aria-label="Ativar sons do Pomodoro"
        />
      </div>

      <div
        className={
          soundsEnabled ? 'mt-4 flex flex-col gap-4' : 'mt-4 flex flex-col gap-4 opacity-50'
        }
      >
        {STAGE_ROWS.map(({ stage, label }) => (
          <StageRow
            key={stage}
            label={label}
            soundKey={stageSounds[stage]}
            volume={volume}
            disabled={!soundsEnabled}
            onChange={(key) => setStageSound(stage, key)}
          />
        ))}

        <div className="mt-1 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Volume</span>
          <Slider
            value={[volume]}
            onValueChange={([value]) => setVolume(value)}
            max={100}
            step={5}
            disabled={!soundsEnabled}
            className="max-w-48"
          />
          <span className="w-9 text-right text-xs text-muted-foreground">
            {volume}%
          </span>
        </div>
      </div>
    </Card>
  )
}

function StageRow({
  label,
  soundKey,
  volume,
  disabled,
  onChange,
}: {
  label: string
  soundKey: string
  volume: number
  disabled: boolean
  onChange: (key: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Select value={soundKey} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Som" />
          </SelectTrigger>
          <SelectContent>
            {SOUND_LIBRARY.map((sound) => (
              <SelectItem key={sound.key} value={sound.key}>
                {sound.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Ouvir som ${label}`}
          disabled={disabled}
          onClick={() => playPomodoroSound(soundKey, volume)}
        >
          <Play className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
