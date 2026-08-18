import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Link2, Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PriorityStars } from './priority-stars'
import { SubjectColorBadge } from './subject-color-badge'
import { subjectSchema, type SubjectFormValues } from './subject-form-schema'
import { SUBJECT_COLORS } from '@/utils/subject-colors'
import { cn } from '@/lib/utils'
import { fileToResizedDataUrl } from '@/utils/image'
import { useSubjectsStore } from '@/stores/subjects-store'
import type { Subject } from '@/types/subject'

interface SubjectFormDialogProps {
  trigger: ReactNode
  subject?: Subject
  onSubmit: (values: SubjectFormValues) => void
}

const emptyValues: SubjectFormValues = {
  name: '',
  color: SUBJECT_COLORS[0],
  priority: 3,
  goal: '',
  imageUrl: null,
  totalLessons: null,
  reviewCount: 3,
  reviewDurationMinutes: 30,
}

export function SubjectFormDialog({
  trigger,
  subject,
  onSubmit,
}: SubjectFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [showUrlField, setShowUrlField] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const setCompletedLessons = useSubjectsStore(
    (state) => state.setCompletedLessons,
  )
  const removeSubject = useSubjectsStore((state) => state.removeSubject)
  const liveCompletedLessons = useSubjectsStore((state) =>
    subject ? state.subjects.find((item) => item.id === subject.id)?.completedLessons : undefined,
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject ?? emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(subject ?? emptyValues)
      setShowUrlField(false)
      setUrlInput('')
    }
  }, [open, subject, reset])

  function handleFormSubmit(values: SubjectFormValues) {
    onSubmit(values)
    setOpen(false)
  }

  function handleDelete() {
    if (!subject) return
    removeSubject(subject.id)
    toast.success('Matéria removida')
    setOpen(false)
  }

  const watchedName = watch('name')
  const watchedColor = watch('color')
  const watchedTotalLessons = watch('totalLessons')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subject ? 'Editar matéria' : 'Nova matéria'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(handleFormSubmit)(event)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Imagem
            </span>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <SubjectColorBadge
                    name={watchedName || '?'}
                    color={watchedColor}
                    imageUrl={field.value}
                    size={48}
                  />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        {field.value ? 'Trocar' : 'Enviar arquivo'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowUrlField((value) => !value)}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Link da internet
                      </Button>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-muted-foreground hover:text-destructive"
                          onClick={() => field.onChange(null)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </Button>
                      )}
                    </div>

                    {showUrlField && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="url"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={urlInput}
                          onChange={(event) => setUrlInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter') return
                            event.preventDefault()
                            if (!urlInput.trim()) return
                            field.onChange(urlInput.trim())
                          }}
                          className="h-8 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={!urlInput.trim()}
                          onClick={() => field.onChange(urlInput.trim())}
                        >
                          Usar
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (!file) return
                      if (!file.type.startsWith('image/')) {
                        toast.error('Selecione um arquivo de imagem.')
                        return
                      }
                      try {
                        const dataUrl = await fileToResizedDataUrl(file)
                        field.onChange(dataUrl)
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Não foi possível carregar a imagem.',
                        )
                      }
                    }}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="subject-name"
            >
              Nome
            </label>
            <Input
              id="subject-name"
              placeholder="Ex: JavaScript"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Cor</span>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Cor ${color}`}
                      onClick={() => field.onChange(color)}
                      className={cn(
                        'h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-shadow',
                        field.value === color && 'ring-2 ring-foreground',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Prioridade
            </span>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <PriorityStars
                  value={field.value}
                  onChange={field.onChange}
                  size={22}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="subject-goal"
            >
              Objetivo
            </label>
            <Input
              id="subject-goal"
              placeholder="Ex: Ser aprovado no concurso X"
              {...register('goal')}
            />
            {errors.goal && (
              <p className="text-xs text-destructive">
                {errors.goal.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="subject-total-lessons"
            >
              Total de aulas (opcional)
            </label>
            <p className="text-xs text-muted-foreground">
              Informe quantas aulas essa matéria tem para calcular o progresso
              automaticamente.
            </p>
            <Controller
              control={control}
              name="totalLessons"
              render={({ field }) => (
                <Input
                  id="subject-total-lessons"
                  type="number"
                  min={1}
                  placeholder="Ex: 20"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value
                    field.onChange(raw === '' ? null : Number(raw))
                  }}
                />
              )}
            />
            {errors.totalLessons && (
              <p className="text-xs text-destructive">
                {errors.totalLessons.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="subject-review-count"
            >
              Quantas revisões automáticas
            </label>
            <p className="text-xs text-muted-foreground">
              Depois de concluir uma tarefa dessa matéria, quantas revisões
              espaçadas devem ser agendadas. 0 desativa.
            </p>
            <Controller
              control={control}
              name="reviewCount"
              render={({ field }) => (
                <Input
                  id="subject-review-count"
                  type="number"
                  min={0}
                  max={8}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              )}
            />
            {errors.reviewCount && (
              <p className="text-xs text-destructive">
                {errors.reviewCount.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="subject-review-duration"
            >
              Duração de cada revisão (min)
            </label>
            <Controller
              control={control}
              name="reviewDurationMinutes"
              render={({ field }) => (
                <Input
                  id="subject-review-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 5)
                  }
                />
              )}
            />
            {errors.reviewDurationMinutes && (
              <p className="text-xs text-destructive">
                {errors.reviewDurationMinutes.message}
              </p>
            )}
          </div>

          {subject && watchedTotalLessons && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Aulas concluídas
              </span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={(liveCompletedLessons ?? 0) <= 0}
                  onClick={() =>
                    setCompletedLessons(subject.id, (liveCompletedLessons ?? 0) - 1)
                  }
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[4rem] text-center text-sm text-foreground">
                  {liveCompletedLessons ?? 0} / {watchedTotalLessons}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={(liveCompletedLessons ?? 0) >= watchedTotalLessons}
                  onClick={() =>
                    setCompletedLessons(subject.id, (liveCompletedLessons ?? 0) + 1)
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className={cn(subject && 'sm:justify-between')}>
            {subject && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Excluir matéria
              </Button>
            )}
            <Button type="submit">
              {subject ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
