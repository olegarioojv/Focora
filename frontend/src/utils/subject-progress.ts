import type { Subject } from '@/types/subject'

type ProgressFields = Pick<Subject, 'totalLessons' | 'completedLessons'>

/** null when totalLessons isn't set — the % is undefined/not applicable,
 * not "0%" (which would misleadingly suggest zero progress on a subject
 * that simply never had a lesson count configured). */
export function getSubjectProgress(subject: ProgressFields): number | null {
  if (!subject.totalLessons) return null
  return Math.round((subject.completedLessons / subject.totalLessons) * 100)
}
