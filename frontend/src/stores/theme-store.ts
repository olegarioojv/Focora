import { create } from 'zustand'
import { toast } from 'sonner'
import { settingsApi } from '@/services/settings-api'
import { ApiError } from '@/services/api-client'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  hydrate: (theme: Theme) => void
  setTheme: (theme: Theme) => void
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: 'dark',
  hydrate: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
    settingsApi
      .update({ theme })
      .catch((error) =>
        toast.error(
          error instanceof ApiError ? error.message : 'Não foi possível salvar o tema',
        ),
      )
  },
}))
