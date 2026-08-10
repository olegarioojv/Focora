import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { usePomodoroSettingsStore } from '@/stores/pomodoro-settings-store'
import { POMODORO_PRESETS } from '@/stores/pomodoro-store'
import {
  isNotificationSupported,
  requestNotificationPermission,
} from '@/utils/notifications'

const BREAK_PRESETS = [5, 10, 15, 20] as const
const DAILY_GOAL_PRESETS = [2, 4, 6, 8] as const

export function PomodoroSettingsSection() {
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
  const setDefaultDurationMinutes = usePomodoroSettingsStore(
    (state) => state.setDefaultDurationMinutes,
  )
  const setDefaultBreakMinutes = usePomodoroSettingsStore(
    (state) => state.setDefaultBreakMinutes,
  )
  const setDailyGoalPomodoros = usePomodoroSettingsStore(
    (state) => state.setDailyGoalPomodoros,
  )
  const setNotifyOnComplete = usePomodoroSettingsStore(
    (state) => state.setNotifyOnComplete,
  )

  async function handleNotifyToggle(checked: boolean) {
    if (checked && isNotificationSupported() && Notification.permission !== 'granted') {
      const result = await requestNotificationPermission()
      if (result !== 'granted') {
        toast.error('Permissão de notificações negada')
        return
      }
      toast.success('Notificações ativadas')
    }
    setNotifyOnComplete(checked)
  }

  return (
    <Card className="border border-border p-6">
      <h3 className="font-heading text-base font-medium">
        Configuração do Pomodoro
      </h3>

      <div className="mt-4">
        <span className="text-sm font-medium text-foreground">
          Duração padrão
        </span>
        <div className="mt-2 flex items-center gap-2">
          {POMODORO_PRESETS.map((minutes) => (
            <Button
              key={minutes}
              type="button"
              size="sm"
              variant={
                defaultDurationMinutes === minutes ? 'default' : 'outline'
              }
              onClick={() => setDefaultDurationMinutes(minutes)}
            >
              {minutes} min
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <span className="text-sm font-medium text-foreground">
          Tempo de descanso
        </span>
        <div className="mt-2 flex items-center gap-2">
          {BREAK_PRESETS.map((minutes) => (
            <Button
              key={minutes}
              type="button"
              size="sm"
              variant={defaultBreakMinutes === minutes ? 'default' : 'outline'}
              onClick={() => setDefaultBreakMinutes(minutes)}
            >
              {minutes} min
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <span className="text-sm font-medium text-foreground">
          Meta de pomodoros por dia
        </span>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Usado para calcular o progresso em "Metas do dia" no painel.
        </p>
        <div className="mt-2 flex items-center gap-2">
          {DAILY_GOAL_PRESETS.map((count) => (
            <Button
              key={count}
              type="button"
              size="sm"
              variant={dailyGoalPomodoros === count ? 'default' : 'outline'}
              onClick={() => setDailyGoalPomodoros(count)}
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Notificar ao concluir um ciclo
          </p>
          <p className="text-xs text-muted-foreground">
            Envia uma notificação do navegador quando o Pomodoro terminar.
          </p>
        </div>
        <Switch
          checked={notifyOnComplete}
          onCheckedChange={(checked) => void handleNotifyToggle(checked)}
        />
      </div>
    </Card>
  )
}
