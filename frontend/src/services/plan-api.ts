import { apiGet, apiPatch } from './api-client'

export interface PlanResponse {
  id: string
  objective: string
  weekStart: string | null
}

export interface UpdatePlanInput {
  objective?: string
  weekStart?: string
}

export const planApi = {
  get: () => apiGet<PlanResponse>('/plan'),
  update: (input: UpdatePlanInput) => apiPatch<PlanResponse>('/plan', input),
}
