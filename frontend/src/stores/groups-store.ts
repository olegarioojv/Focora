import { create } from 'zustand'
import type { GroupSummary } from '@/services/groups-api'

interface GroupsState {
  groups: GroupSummary[]
  hydrate: (groups: GroupSummary[]) => void
  reset: () => void
}

export const useGroupsStore = create<GroupsState>()((set) => ({
  groups: [],
  hydrate: (groups) => set({ groups }),
  reset: () => set({ groups: [] }),
}))
