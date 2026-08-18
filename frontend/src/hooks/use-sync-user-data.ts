import { subjectsApi } from '@/services/subjects-api'
import { planApi } from '@/services/plan-api'
import { reviewsApi } from '@/services/reviews-api'
import { settingsApi, dailyLogsApi, rankingApi } from '@/services/settings-api'
import { usersApi } from '@/services/users-api'
import { notesApi } from '@/services/notes-api'
import { flashcardsApi } from '@/services/flashcards-api'
import { useSubjectsStore } from '@/stores/subjects-store'
import { usePlanStore } from '@/stores/plan-store'
import { useReviewsStore } from '@/stores/reviews-store'
import { useGamificationStore } from '@/stores/gamification-store'
import { usePomodoroSettingsStore } from '@/stores/pomodoro-settings-store'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { useAuthStore } from '@/stores/auth-store'
import { useDailyLogsStore } from '@/stores/daily-logs-store'
import { useRankingStore } from '@/stores/ranking-store'
import { useNotesStore } from '@/stores/notes-store'
import { useFlashcardsStore } from '@/stores/flashcards-store'

/** Fetches everything for the signed-in user and hydrates the local
 * stores that components already read from. Call once after login/
 * register succeeds, and once on app boot if a session is already
 * saved (see AuthBootstrap). */
export async function syncUserData() {
  const [
    subjects,
    plan,
    reviews,
    settings,
    user,
    dailyLogs,
    ranking,
    notes,
    flashcards,
  ] = await Promise.all([
    subjectsApi.list(),
    planApi.get(),
    reviewsApi.list(),
    settingsApi.get(),
    usersApi.me(),
    dailyLogsApi.list(),
    rankingApi.list(),
    notesApi.list(),
    flashcardsApi.list(),
  ])

  useSubjectsStore.getState().hydrate(subjects)
  usePlanStore.getState().hydrate(plan)
  useReviewsStore.getState().hydrate(reviews)
  useGamificationStore.getState().hydrate(settings)
  usePomodoroSettingsStore.getState().hydrate(settings)
  useThemeStore.getState().hydrate(settings.theme)
  useProfileStore.getState().hydrate(user)
  useAuthStore.getState().setUser(user)
  useDailyLogsStore.getState().hydrate(dailyLogs)
  useRankingStore.getState().hydrate(ranking)
  useNotesStore.getState().hydrate(notes)
  useFlashcardsStore.getState().hydrate(flashcards)
}

/** Clears every synced store back to its empty state — used on logout
 * so a next login on the same browser doesn't flash the previous
 * user's data before the fresh sync completes. */
export function resetSyncedStores() {
  useSubjectsStore.getState().hydrate([])
  usePlanStore.getState().hydrate(null)
  useReviewsStore.getState().hydrate([])
  useGamificationStore.getState().reset()
  usePomodoroSettingsStore.getState().reset()
  useDailyLogsStore.getState().reset()
  useRankingStore.getState().reset()
  useNotesStore.getState().hydrate([])
  useFlashcardsStore.getState().hydrate([])
}
