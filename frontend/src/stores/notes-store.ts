import { create } from 'zustand'
import { toast } from 'sonner'
import type { Note } from '@/types/note'
import {
  notesApi,
  type CreateNoteInput,
  type UpdateNoteInput,
} from '@/services/notes-api'
import { ApiError } from '@/services/api-client'

interface NotesState {
  notes: Note[]
  hydrate: (notes: Note[]) => void
  addNote: (input: CreateNoteInput) => Promise<Note>
  updateNote: (id: string, input: UpdateNoteInput) => Promise<void>
  removeNote: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  toggleArchived: (id: string) => Promise<void>
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  hydrate: (notes) => set({ notes }),
  addNote: (input) => {
    const tempId = crypto.randomUUID()
    const now = new Date().toISOString()
    const optimisticNote: Note = {
      id: tempId,
      title: input.title,
      content: input.content ?? '',
      subjectId: input.subjectId ?? null,
      isFavorite: input.isFavorite ?? false,
      isArchived: input.isArchived ?? false,
      createdAt: now,
      updatedAt: now,
      tags: input.tags ?? [],
      outboundLinks: [],
      inboundLinks: [],
    }

    set((state) => ({ notes: [...state.notes, optimisticNote] }))

    return notesApi
      .create(input)
      .then((created) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === tempId ? created : note,
          ),
        }))
        return created
      })
      .catch((error) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== tempId),
        }))
        reportError(error, 'Não foi possível criar a nota')
        throw error
      })
  },
  updateNote: (id, input) => {
    const previous = get().notes
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...input } : note,
      ),
    }))

    return notesApi
      .update(id, input)
      .then((updated) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? updated : note)),
        }))
      })
      .catch((error) => {
        set({ notes: previous })
        reportError(error, 'Não foi possível salvar a nota')
        throw error
      })
  },
  removeNote: (id) => {
    const previous = get().notes
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }))

    return notesApi
      .remove(id)
      .catch((error) => {
        set({ notes: previous })
        reportError(error, 'Não foi possível remover a nota')
        throw error
      })
  },
  toggleFavorite: (id) => {
    const note = get().notes.find((item) => item.id === id)
    if (!note) return Promise.resolve()
    return get().updateNote(id, { isFavorite: !note.isFavorite })
  },
  toggleArchived: (id) => {
    const note = get().notes.find((item) => item.id === id)
    if (!note) return Promise.resolve()
    return get().updateNote(id, { isArchived: !note.isArchived })
  },
}))

export function getRelatedNotes(note: Note, allNotes: Note[]): Note[] {
  const linkedIds = new Set([...note.outboundLinks, ...note.inboundLinks])
  const tagSet = new Set(note.tags)

  const related = allNotes.filter((candidate) => {
    if (candidate.id === note.id) return false
    if (candidate.isArchived) return false

    if (linkedIds.has(candidate.id)) return true
    if (note.subjectId && candidate.subjectId === note.subjectId) return true
    if (candidate.tags.some((tag) => tagSet.has(tag))) return true

    return false
  })

  const deduped = new Map(related.map((item) => [item.id, item]))
  return Array.from(deduped.values())
}

const NOTE_LINK_REGEX = /\[\[([^\]]+)\]\]/g

function extractLinkTitles(content: string): string[] {
  const titles: string[] = []
  const regex = new RegExp(NOTE_LINK_REGEX)
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    titles.push(match[1])
  }
  return titles
}

export function resolveNoteLinks(
  content: string,
  allNotes: Note[],
): Map<string, string> {
  const resolved = new Map<string, string>()
  const titles = extractLinkTitles(content)

  for (const title of titles) {
    const match = allNotes.find(
      (note) => note.title.toLowerCase() === title.toLowerCase(),
    )
    if (match) resolved.set(title, match.id)
  }

  return resolved
}

export function getBrokenLinkTitles(
  content: string,
  allNotes: Note[],
): string[] {
  const titles = extractLinkTitles(content)
  const broken = titles.filter(
    (title) =>
      !allNotes.some(
        (note) => note.title.toLowerCase() === title.toLowerCase(),
      ),
  )
  return Array.from(new Set(broken))
}
