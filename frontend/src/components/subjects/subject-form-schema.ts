import { z } from 'zod'

export const subjectSchema = z.object({
  name: z.string().min(2, 'Informe o nome da matéria'),
  color: z.string().min(1, 'Escolha uma cor'),
  priority: z.number().min(1).max(5),
  goal: z.string().min(3, 'Descreva o objetivo'),
  imageUrl: z.string().nullable(),
  totalLessons: z
    .number()
    .int()
    .min(1, 'Informe pelo menos 1 aula')
    .nullable(),
  reviewCount: z.number().int().min(0).max(8),
  reviewDurationMinutes: z.number().int().min(5),
})

export type SubjectFormValues = z.infer<typeof subjectSchema>
