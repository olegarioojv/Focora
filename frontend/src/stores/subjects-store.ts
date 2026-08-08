import { create } from 'zustand'
import { toast } from 'sonner'
import type { Subject, SubjectPriority } from '@/types/subject'
import type { Weekday } from '@/types/plan'
import { subjectsApi } from '@/services/subjects-api'
import { ApiError } from '@/services/api-client'
import { usePlanStore } from './plan-store'
import { useReviewsStore } from './reviews-store'
import { WEEKDAYS } from '@/types/plan'

export interface SubjectInput {
  name: string
  color: string
  priority: SubjectPriority
  goal: string
  preferredDays: Weekday[]
  imageUrl: string | null
}

interface SubjectsState {
  subjects: Subject[]
  hydrate: (subjects: Subject[]) => void
  addSubject: (input: SubjectInput) => void
  updateSubject: (id: string, input: SubjectInput) => void
  removeSubject: (id: string) => void
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

export const useSubjectsStore = create<SubjectsState>()((set, get) => ({
  subjects: [],
  hydrate: (subjects) => set({ subjects }),
  addSubject: (input) => {
    const tempId = crypto.randomUUID()
    set((state) => ({
      subjects: [...state.subjects, { id: tempId, progress: 0, ...input }],
    }))

    subjectsApi
      .create(input)
      .then((created) => {
        set((state) => ({
          subjects: state.subjects.map((subject) =>
            subject.id === tempId ? created : subject,
          ),
        }))
      })
      .catch((error) => {
        set((state) => ({
          subjects: state.subjects.filter((subject) => subject.id !== tempId),
        }))
        reportError(error, 'Não foi possível adicionar a matéria')
      })
  },
  updateSubject: (id, input) => {
    set((state) => ({
      subjects: state.subjects.map((subject) =>
        subject.id === id ? { ...subject, ...input } : subject,
      ),
    }))

    subjectsApi
      .update(id, input)
      .catch((error) => reportError(error, 'Não foi possível salvar a matéria'))
  },
  removeSubject: (id) => {
    const previous = get().subjects
    set((state) => ({
      subjects: state.subjects.filter((subject) => subject.id !== id),
    }))

    subjectsApi
      .remove(id)
      .then(() => {
        // The backend also cascades this delete to schedule tasks and
        // reviews referencing the subject — mirror that locally so the
        // UI doesn't keep showing now-orphaned (and now server-deleted)
        // entries until the next full reload.
        const { schedule } = usePlanStore.getState()
        if (schedule) {
          const cleaned = { ...schedule }
          for (const day of WEEKDAYS) {
            cleaned[day] = cleaned[day].filter((task) => task.subjectId !== id)
          }
          usePlanStore.setState({ schedule: cleaned })
        }
        useReviewsStore.setState((state) => ({
          reviews: state.reviews.filter((review) => review.subjectId !== id),
        }))
      })
      .catch((error) => {
        set({ subjects: previous })
        reportError(error, 'Não foi possível remover a matéria')
      })
  },
}))
