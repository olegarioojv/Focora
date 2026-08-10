import { apiDelete, apiGet, apiPatch, apiPost } from './api-client'
import type { SubjectInput } from '@/stores/subjects-store'
import type { Subject } from '@/types/subject'

export const subjectsApi = {
  list: () => apiGet<Subject[]>('/subjects'),
  create: (input: SubjectInput) => apiPost<Subject>('/subjects', input),
  update: (id: string, input: SubjectInput) =>
    apiPatch<Subject>(`/subjects/${id}`, input),
  setCompletedLessons: (id: string, completedLessons: number) =>
    apiPatch<Subject>(`/subjects/${id}`, { completedLessons }),
  remove: (id: string) => apiDelete<void>(`/subjects/${id}`),
}
