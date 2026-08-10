import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ANNOUNCEMENTS } from '@/data/announcements'

interface AnnouncementsState {
  lastSeenId: string | null
  markAllSeen: () => void
}

export const useAnnouncementsStore = create<AnnouncementsState>()(
  persist(
    (set) => ({
      lastSeenId: null,
      markAllSeen: () => set({ lastSeenId: ANNOUNCEMENTS[0]?.id ?? null }),
    }),
    { name: 'focora-announcements' },
  ),
)

/** True when the newest announcement hasn't been seen yet on this device —
 * a fresh install (lastSeenId: null) counts as unread too, same as any
 * other unseen entry. */
export function hasUnreadAnnouncements(lastSeenId: string | null): boolean {
  return ANNOUNCEMENTS.length > 0 && ANNOUNCEMENTS[0].id !== lastSeenId
}
