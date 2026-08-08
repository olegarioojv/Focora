import { ProfileSection } from './components/profile-section'
import { PomodoroSettingsSection } from './components/pomodoro-settings-section'
import { ThemeSection } from './components/theme-section'
import { BackupSection } from './components/backup-section'

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Personalize seu perfil, o Pomodoro e faça backup dos seus dados.
        </p>
      </div>

      <ProfileSection />
      <PomodoroSettingsSection />
      <ThemeSection />
      <BackupSection />
    </div>
  )
}
