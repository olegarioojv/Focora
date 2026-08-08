import { apiGet, apiPatch } from './api-client'
import type { WeeklyAvailability, WeeklySchedule } from '@/types/plan'

export interface PlanResponse {
  id: string
  objective: string
  availability: WeeklyAvailability
  schedule: WeeklySchedule | null
}

export interface UpdatePlanInput {
  objective?: string
  availability?: WeeklyAvailability
  schedule?: WeeklySchedule | null
}

export const planApi = {
  get: () => apiGet<PlanResponse>('/plan'),
  update: (input: UpdatePlanInput) => apiPatch<PlanResponse>('/plan', input),
}
