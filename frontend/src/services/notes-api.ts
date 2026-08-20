import { apiDelete, apiGet, apiPatch, apiPost } from './api-client'
import type { Note } from '@/types/note'

interface RawTagResponse {
  id: string
  userId: string
  name: string
  createdAt: string
}

interface RawNoteTagResponse {
  tag: RawTagResponse
}

interface RawNoteLinkResponse {
  id: string
  sourceNoteId: string
  targetNoteId: string
  createdAt: string
}

export interface RawNoteResponse {
  id: string
  title: string
  content: string
  subjectId: string | null
  isFavorite: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  tags: RawNoteTagResponse[]
  outboundLinks: RawNoteLinkResponse[]
  inboundLinks: RawNoteLinkResponse[]
}

export function mapNoteResponse(raw: RawNoteResponse): Note {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    subjectId: raw.subjectId,
    isFavorite: raw.isFavorite,
    isArchived: raw.isArchived,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    tags: raw.tags.map((t) => t.tag.name),
    outboundLinks: raw.outboundLinks.map((l) => l.targetNoteId),
    inboundLinks: raw.inboundLinks.map((l) => l.sourceNoteId),
  }
}

export interface CreateNoteInput {
  title: string
  content?: string
  subjectId?: string | null
  tags?: string[]
  isFavorite?: boolean
  isArchived?: boolean
}

export type UpdateNoteInput = Partial<CreateNoteInput>

export const notesApi = {
  list: () =>
    apiGet<RawNoteResponse[]>('/notes').then((rows) => rows.map(mapNoteResponse)),
  create: (input: CreateNoteInput) =>
    apiPost<RawNoteResponse>('/notes', input).then(mapNoteResponse),
  update: (id: string, input: UpdateNoteInput) =>
    apiPatch<RawNoteResponse>(`/notes/${id}`, input).then(mapNoteResponse),
  remove: (id: string) => apiDelete<void>(`/notes/${id}`),
}
