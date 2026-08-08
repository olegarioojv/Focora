import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Flame, LogOut, Settings2, ShieldCheck, Timer, Trash2, Users, Zap } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useProfileStore } from '@/stores/profile-store'
import { useGamificationStore } from '@/stores/gamification-store'
import { usePomodoroSettingsStore } from '@/stores/pomodoro-settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestTrialStore } from '@/stores/guest-trial-store'
import { POMODORO_PRESETS } from '@/stores/pomodoro-store'
import { getLevelProgress } from '@/utils/gamification'
import { getChallengeDayNumber } from '@/utils/challenge-day'
import { fileToResizedDataUrl } from '@/utils/image'
import { resetSyncedStores, syncUserData } from '@/hooks/use-sync-user-data'
import { authApi } from '@/services/auth-api'
import { useAuthModalStore } from '@/stores/auth-modal-store'

const TOTAL_DAYS = 100
const BREAK_PRESETS = [5, 10, 15, 20] as const

export function ProfileModal() {
  const navigate = useNavigate()
  const isGuest = useAuthStore((state) => state.user?.isGuest ?? false)
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin')
  const clearSession = useAuthStore((state) => state.clearSession)
  const setUser = useAuthStore((state) => state.setUser)
  const setExpired = useGuestTrialStore((state) => state.setExpired)
  const openLogin = useAuthModalStore((state) => state.openLogin)
  const name = useProfileStore((state) => state.name)
  const setName = useProfileStore((state) => state.setName)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl)
  const xp = useGamificationStore((state) => state.xp)
  const currentStreak = useGamificationStore((state) => state.currentStreak)
  const challengeStartDate = useGamificationStore(
    (state) => state.challengeStartDate,
  )
  const { level } = getLevelProgress(xp)
  const daysCompleted = Math.min(
    TOTAL_DAYS,
    getChallengeDayNumber(challengeStartDate),
  )

  const defaultDurationMinutes = usePomodoroSettingsStore(
    (state) => state.defaultDurationMinutes,
  )
  const defaultBreakMinutes = usePomodoroSettingsStore(
    (state) => state.defaultBreakMinutes,
  )
  const setDefaultDurationMinutes = usePomodoroSettingsStore(
    (state) => state.setDefaultDurationMinutes,
  )
  const setDefaultBreakMinutes = usePomodoroSettingsStore(
    (state) => state.setDefaultBreakMinutes,
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const initials = name.slice(0, 2).toUpperCase()

  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [showCustomBreak, setShowCustomBreak] = useState(false)
  const [open, setOpen] = useState(false)

  function goTo(path: string) {
    setOpen(false)
    navigate(path)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.')
      return
    }

    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível carregar a imagem.',
      )
    }
  }

  async function handleLogout() {
    await authApi.logout()
    clearSession()
    resetSyncedStores()
    setExpired(false)
    const session = await authApi.guest()
    setUser(session.user)
    await syncUserData()
    navigate('/app')
  }

  if (isGuest) {
    return (
      <button
        type="button"
        aria-label="Ver perfil"
        onClick={openLogin}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
            👤
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Convidado
        </span>
      </button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label="Ver perfil">
          <Avatar className="h-9 w-9 transition-opacity hover:opacity-80">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarUrl ?? undefined} alt={name} />
                <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                aria-label="Adicionar foto"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-popover bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="min-w-0 flex-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="profile-modal-name"
              >
                Nome
              </label>
              <Input
                id="profile-modal-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 h-9"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Remover foto
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Nível {level}
              </p>
              <p className="text-[10px] text-muted-foreground">{xp} XP</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
              <Flame className="h-4 w-4 text-orange-400" />
              <p className="text-sm font-semibold text-foreground">
                {currentStreak}
              </p>
              <p className="text-[10px] text-muted-foreground">dias seguidos</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
              <span className="text-sm font-semibold text-foreground">
                {daysCompleted}/{TOTAL_DAYS}
              </span>
              <p className="text-[10px] text-muted-foreground">
                dias do desafio
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              Configuração do Pomodoro
            </p>

            <div className="mt-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Duração padrão
                </p>
                <button
                  type="button"
                  aria-label="Definir duração personalizada"
                  onClick={() => setShowCustomDuration((value) => !value)}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground',
                    showCustomDuration && 'bg-accent text-foreground',
                  )}
                >
                  <Settings2 className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {POMODORO_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setDefaultDurationMinutes(minutes)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium',
                      defaultDurationMinutes === minutes
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-accent',
                    )}
                  >
                    {minutes} min
                  </button>
                ))}
                {showCustomDuration && (
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={defaultDurationMinutes}
                    onChange={(event) => {
                      const parsed = Number(event.target.value)
                      if (parsed > 0 && parsed <= 180) {
                        setDefaultDurationMinutes(parsed)
                      }
                    }}
                    className="h-7 w-20 text-xs"
                  />
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Tempo de descanso
                </p>
                <button
                  type="button"
                  aria-label="Definir descanso personalizado"
                  onClick={() => setShowCustomBreak((value) => !value)}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground',
                    showCustomBreak && 'bg-accent text-foreground',
                  )}
                >
                  <Settings2 className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {BREAK_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setDefaultBreakMinutes(minutes)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium',
                      defaultBreakMinutes === minutes
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-accent',
                    )}
                  >
                    {minutes} min
                  </button>
                ))}
                {showCustomBreak && (
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={defaultBreakMinutes}
                    onChange={(event) => {
                      const parsed = Number(event.target.value)
                      if (parsed > 0 && parsed <= 120) {
                        setDefaultBreakMinutes(parsed)
                      }
                    }}
                    className="h-7 w-20 text-xs"
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => goTo('/app/grupos')}
          >
            <Users className="h-4 w-4" />
            Grupos de Estudo
          </Button>

          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={() => goTo('/admin')}
            >
              <ShieldCheck className="h-4 w-4" />
              Painel Administrativo
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
