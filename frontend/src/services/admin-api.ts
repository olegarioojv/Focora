import { apiDelete, apiGet, apiPatch, apiPost } from './api-client'

export interface AdminMetrics {
  users: { total: number; activeToday: number; newToday: number; guests: number }
  totalHoursStudied: number
  totalDaysCompleted: number
  averageStreak: number
  api: { status: string; averageResponseMs: number; requestsLastHour: number }
  database: { status: string; latencyMs: number | null }
  process: {
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number }
    cpuPercent: number
  }
}

export interface AdminUserListItem {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string | null
  isGuest: boolean
  role: 'user' | 'admin'
  blocked: boolean
  isOnline: boolean
}

export interface AdminOnlineUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  role: 'user' | 'admin'
  isGuest: boolean
  lastSeenAt: string
}

export interface AdminUserListResponse {
  items: AdminUserListItem[]
  total: number
  page: number
  pageSize: number
}

export interface AdminUserDetail {
  account: {
    id: string
    name: string
    email: string | null
    avatarUrl: string | null
    role: 'user' | 'admin'
    isGuest: boolean
    blocked: boolean
    createdAt: string
    lastLoginAt: string | null
    lastLoginIp: string | null
    lastLoginBrowser: string | null
    lastLoginOs: string | null
  }
  evolution: {
    daysActive: number
    totalHours: number
    currentStreak: number
    longestStreak: number
    challengeStartDate: string | null
    dailyLogs: { id: string; date: string; minutes: number; pomodoros: number }[]
  }
  goals: {
    id: string
    name: string
    color: string
    priority: number
    goal: string
    progress: number
  }[]
}

export interface AdminGroupListItem {
  id: string
  name: string
  icon: string
  type: 'public' | 'private'
  memberCount: number
  maxMembers: number
  ownerId: string
  ownerName: string
  createdAt: string
}

export interface AdminGroupListResponse {
  items: AdminGroupListItem[]
  total: number
  page: number
  pageSize: number
}

export interface AdminGroupDetail {
  id: string
  name: string
  description: string
  icon: string
  type: 'public' | 'private'
  maxMembers: number
  inviteCode: string
  createdAt: string
  owner: { id: string; name: string; email: string | null }
  members: {
    userId: string
    name: string
    email: string | null
    joinedAt: string
    isOwner: boolean
  }[]
}

export interface AdminLogEntry {
  id: string
  createdAt: string
  method: string
  endpoint: string
  statusCode: number
  durationMs: number
  userId: string | null
  targetUserId: string | null
  eventType: string
  ip: string | null
  userAgent: string | null
  browser: string | null
  os: string | null
}

export interface AdminLogListResponse {
  items: AdminLogEntry[]
  total: number
  page: number
  pageSize: number
}

export interface AdminErrorEntry {
  id: string
  fingerprint: string
  message: string
  stack: string | null
  endpoint: string | null
  method: string | null
  userId: string | null
  severity: string
  environment: string
  occurrenceCount: number
  payload: unknown
  firstSeenAt: string
  lastSeenAt: string
}

export interface AdminHealth {
  api: { status: string }
  database: { status: string; latencyMs: number | null }
  process: {
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number }
    cpuPercent: number
  }
}

export interface AdminHealthSnapshot {
  id: string
  createdAt: string
  dbStatus: string
  dbLatencyMs: number | null
  cpuPercent: number
  memoryRssMb: number
}

export interface AdminRequestsTimelinePoint {
  minute: string
  total: number
  errors: number
}

export interface AdminRealtime {
  activeUsers: number
  requestsPerSecond: number
  database: { status: string; latencyMs: number | null }
  process: {
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number }
    cpuPercent: number
  }
}

export interface AdminAlert {
  id: string
  type: string
  severity: string
  message: string
  triggeredAt: string
  resolvedAt: string | null
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const adminApi = {
  getMetrics: () => apiGet<AdminMetrics>('/admin/metrics'),

  listUsers: (params: {
    search?: string
    role?: 'admin' | 'user' | 'guest'
    status?: 'active' | 'blocked'
    page?: number
  }) =>
    apiGet<AdminUserListResponse>(`/admin/users${toQueryString(params)}`),

  getUser: (id: string) => apiGet<AdminUserDetail>(`/admin/users/${id}`),

  listOnlineUsers: () => apiGet<AdminOnlineUser[]>('/admin/users/online'),

  blockUser: (id: string) =>
    apiPatch<AdminUserListItem>(`/admin/users/${id}/block`),
  unblockUser: (id: string) =>
    apiPatch<AdminUserListItem>(`/admin/users/${id}/unblock`),
  updateRole: (id: string, role: 'user' | 'admin') =>
    apiPatch<AdminUserListItem>(`/admin/users/${id}/role`, { role }),
  resetProgress: (id: string) =>
    apiPost<{ success: boolean }>(`/admin/users/${id}/reset-progress`),
  deleteUser: (id: string) =>
    apiDelete<{ success: boolean }>(`/admin/users/${id}`),

  listGroups: (params: {
    search?: string
    type?: 'public' | 'private'
    page?: number
  }) => apiGet<AdminGroupListResponse>(`/admin/groups${toQueryString(params)}`),

  getGroup: (id: string) => apiGet<AdminGroupDetail>(`/admin/groups/${id}`),

  deleteGroup: (id: string) =>
    apiDelete<{ success: boolean }>(`/admin/groups/${id}`),

  listLogs: (params: {
    userId?: string
    from?: string
    to?: string
    endpoint?: string
    eventType?: string
    statusCode?: number
    page?: number
  }) => apiGet<AdminLogListResponse>(`/admin/logs${toQueryString(params)}`),

  listErrors: () => apiGet<AdminErrorEntry[]>('/admin/errors'),
  getError: (id: string) => apiGet<AdminErrorEntry>(`/admin/errors/${id}`),

  getHealth: () => apiGet<AdminHealth>('/admin/health'),
  getHealthHistory: (hours = 24) =>
    apiGet<AdminHealthSnapshot[]>(`/admin/health/history?hours=${hours}`),
  getRequestsTimeline: (minutes = 60) =>
    apiGet<AdminRequestsTimelinePoint[]>(
      `/admin/health/requests-timeline?minutes=${minutes}`,
    ),
  getRealtime: () => apiGet<AdminRealtime>('/admin/health/realtime'),
  listAlerts: () => apiGet<AdminAlert[]>('/admin/alerts'),
}
