import { Moon, Sun } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme-store'

export function ThemeSection() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <Card className="border border-border p-6">
      <h3 className="font-heading text-base font-medium">Tema</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Escolha entre o tema claro ou escuro para o Focora.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
          className="gap-1.5"
        >
          <Moon className="h-4 w-4" />
          Escuro
        </Button>
        <Button
          type="button"
          size="sm"
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
          className="gap-1.5"
        >
          <Sun className="h-4 w-4" />
          Claro
        </Button>
      </div>
    </Card>
  )
}
