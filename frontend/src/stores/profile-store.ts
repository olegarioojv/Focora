import { create } from 'zustand'
import { toast } from 'sonner'
import { usersApi } from '@/services/users-api'
import { ApiError } from '@/services/api-client'
import { useAuthStore } from './auth-store'

interface ProfileState {
  name: string
  avatarUrl: string | null
  hydrate: (profile: { name: string; avatarUrl: string | null }) => void
  setName: (name: string) => void
  setAvatarUrl: (avatarUrl: string | null) => void
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

let nameSaveTimer: ReturnType<typeof setTimeout> | undefined

export const useProfileStore = create<ProfileState>()((set) => ({
  name: '',
  avatarUrl: null,
  hydrate: (profile) => set(profile),
  // Debounced: saving on every keystroke fired one PATCH per character
  // typed, and out-of-order responses could overwrite the name with a
  // stale value. Only the last edit within the window is sent.
  setName: (name) => {
    set({ name })
    if (nameSaveTimer) clearTimeout(nameSaveTimer)
    nameSaveTimer = setTimeout(() => {
      usersApi
        .update({ name })
        .then((user) => useAuthStore.getState().setUser(user))
        .catch((error) => reportError(error, 'Não foi possível salvar o nome'))
    }, 600)
  },
  setAvatarUrl: (avatarUrl) => {
    set({ avatarUrl })
    usersApi
      .update({ avatarUrl })
      .then((user) => useAuthStore.getState().setUser(user))
      .catch((error) => reportError(error, 'Não foi possível salvar a foto'))
  },
}))
