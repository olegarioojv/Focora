import { z } from 'zod'
import { WEEKDAYS, type Weekday } from '@/types/plan'

const weekdayValues = WEEKDAYS as unknown as [Weekday, ...Weekday[]]

export const subjectSchema = z.object({
  name: z.string().min(2, 'Informe o nome da matéria'),
  color: z.string().min(1, 'Escolha uma cor'),
  priority: z.number().min(1).max(5),
  goal: z.string().min(3, 'Descreva o objetivo'),
  preferredDays: z.array(z.enum(weekdayValues)),
  imageUrl: z.string().nullable(),
  totalLessons: z
    .number()
    .int()
    .min(1, 'Informe pelo menos 1 aula')
    .nullable(),
})

export type SubjectFormValues = z.infer<typeof subjectSchema>
