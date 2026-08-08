import { GamificationModal } from './gamification-modal'
import { ProfileModal } from './profile-modal'
import { ThemeToggleButton } from './theme-toggle-button'

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        <ThemeToggleButton />
        <GamificationModal />
        <ProfileModal />
      </div>
    </header>
  )
}
