import { apiDelete, apiGet, apiPatch, apiPost } from './api-client'

export type GroupType = 'public' | 'private'

export interface GroupSummary {
  id: string
  name: string
  description: string | null
  icon: string
  type: GroupType
  maxMembers: number
  memberCount: number
  isOwner: boolean
}

export interface PublicGroupSummary {
  id: string
  name: string
  description: string | null
  icon: string
  maxMembers: number
  memberCount: number
  isMember: boolean
  inviteCode: string
}

export interface GroupMemberEntry {
  userId: string
  name: string
  avatarUrl: string | null
  xp: number
  currentStreak: number
  weeklyMinutes: number
  daysCompleted: number
  isOnline: boolean
  isOwner: boolean
  joinedAt: string
}

export interface GroupDetail {
  id: string
  name: string
  description: string | null
  icon: string
  type: GroupType
  maxMembers: number
  inviteCode: string
  isOwner: boolean
  members: GroupMemberEntry[]
}

export interface GroupInvitePreview {
  id: string
  name: string
  description: string | null
  icon: string
  memberCount: number
  maxMembers: number
}

export interface CreateGroupInput {
  name: string
  description?: string
  icon: string
  type: GroupType
  maxMembers: number
}

export type UpdateGroupInput = Partial<CreateGroupInput>

export const groupsApi = {
  list: () => apiGet<GroupSummary[]>('/groups'),
  listPublic: (search?: string) =>
    apiGet<PublicGroupSummary[]>(
      `/groups/public${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    ),
  get: (id: string) => apiGet<GroupDetail>(`/groups/${id}`),
  create: (input: CreateGroupInput) => apiPost<GroupDetail>('/groups', input),
  update: (id: string, input: UpdateGroupInput) =>
    apiPatch<GroupDetail>(`/groups/${id}`, input),
  remove: (id: string) => apiDelete<void>(`/groups/${id}`),
  leave: (id: string) => apiPost<void>(`/groups/${id}/leave`),
  kick: (id: string, userId: string) =>
    apiDelete<void>(`/groups/${id}/members/${userId}`),
  previewInvite: (code: string) =>
    apiGet<GroupInvitePreview>(`/groups/invite/${code}`),
  join: (inviteCode: string) =>
    apiPost<{ id: string }>('/groups/join', { inviteCode }),
}
