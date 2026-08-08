import { apiGet, apiPatch, apiPost } from './api-client'
import type { Review } from '@/types/review'

export const reviewsApi = {
  list: () => apiGet<Review[]>('/reviews'),
  createBatch: (reviews: Review[]) =>
    apiPost<Review[]>('/reviews', { reviews }),
  update: (id: string, input: { completed?: boolean; notified?: boolean }) =>
    apiPatch<Review>(`/reviews/${id}`, input),
}
