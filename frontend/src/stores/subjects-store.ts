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
  totalLessons: number | null
}

interface SubjectsState {
  subjects: Subject[]
  hydrate: (subjects: Subject[]) => void
  addSubject: (input: SubjectInput) => void
  updateSubject: (id: string, input: SubjectInput) => void
  removeSubject: (id: string) => void
  setCompletedLessons: (id: string, completedLessons: number) => void
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
      subjects: [
        ...state.subjects,
        { id: tempId, completedLessons: 0, ...input },
      ],
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
  setCompletedLessons: (id, completedLessons) => {
    const previous = get().subjects
    const target = previous.find((subject) => subject.id === id)
    if (!target) return
    // Clamp locally too so a fast double-click can't visually overshoot
    // the total before the server's own clamp comes back.
    const clamped = target.totalLessons
      ? Math.min(Math.max(completedLessons, 0), target.totalLessons)
      : Math.max(completedLessons, 0)

    set((state) => ({
      subjects: state.subjects.map((subject) =>
        subject.id === id
          ? { ...subject, completedLessons: clamped }
          : subject,
      ),
    }))

    subjectsApi
      .setCompletedLessons(id, clamped)
      .catch((error) => {
        set({ subjects: previous })
        reportError(error, 'Não foi possível salvar o progresso')
      })
  },
}))
