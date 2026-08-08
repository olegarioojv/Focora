import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePlanStore } from '@/stores/plan-store'
import { useSubjectsStore } from '@/stores/subjects-store'
import type { ScheduleTask, Weekday } from '@/types/plan'

interface AddTaskDialogProps {
  day: Weekday
}

export function AddTaskDialog({ day }: AddTaskDialogProps) {
  const subjects = useSubjectsStore((state) => state.subjects)
  const addTask = usePlanStore((state) => state.addTask)

  const [open, setOpen] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [type, setType] = useState<ScheduleTask['type']>('Estudos')
  const [durationMinutes, setDurationMinutes] = useState('30')

  function resetForm() {
    setSubjectId('')
    setType('Estudos')
    setDurationMinutes('30')
  }

  function handleSubmit() {
    if (!subjectId) return
    addTask(day, {
      subjectId,
      type,
      durationMinutes: Number(durationMinutes) || 30,
    })
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar tarefa
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar tarefa</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Matéria
            </label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma matéria" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Tipo
            </label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ScheduleTask['type'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Estudos">Estudos</SelectItem>
                <SelectItem value="Revisão">Revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Duração (min)
            </label>
            <Input
              type="number"
              min={5}
              step={5}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!subjectId}
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
