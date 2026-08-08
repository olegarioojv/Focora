import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'

export function ThemeToggleButton() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
    >
      {theme === 'dark' ? (
        <Moon className="h-4.5 w-4.5" />
      ) : (
        <Sun className="h-4.5 w-4.5" />
      )}
    </button>
  )
}
