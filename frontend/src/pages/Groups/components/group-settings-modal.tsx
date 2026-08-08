import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Settings, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GroupFormFields } from './group-form-fields'
import { groupsApi, type GroupDetail, type GroupType } from '@/services/groups-api'
import { ApiError } from '@/services/api-client'

interface GroupSettingsModalProps {
  group: GroupDetail
  onUpdated: (group: GroupDetail) => void
  onDeleted: () => void
}

export function GroupSettingsModal({
  group,
  onUpdated,
  onDeleted,
}: GroupSettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description ?? '')
  const [icon, setIcon] = useState(group.icon)
  const [type, setType] = useState<GroupType>(group.type)
  const [maxMembers, setMaxMembers] = useState(group.maxMembers)

  useEffect(() => {
    if (!open) return
    setName(group.name)
    setDescription(group.description ?? '')
    setIcon(group.icon)
    setType(group.type)
    setMaxMembers(group.maxMembers)
  }, [open, group])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('Dê um nome para o grupo')
      return
    }

    setSubmitting(true)
    try {
      const updated = await groupsApi.update(group.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        type,
        maxMembers,
      })
      toast.success('Grupo atualizado')
      setOpen(false)
      onUpdated(updated)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível atualizar o grupo',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Apagar o grupo "${group.name}"? Isso não pode ser desfeito.`)) {
      return
    }
    try {
      await groupsApi.remove(group.id)
      toast.success('Grupo apagado')
      onDeleted()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível apagar o grupo',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Settings className="h-3.5 w-3.5" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do grupo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <GroupFormFields
            idPrefix="edit-group"
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
            icon={icon}
            onIconChange={setIcon}
            type={type}
            onTypeChange={setType}
            maxMembers={maxMembers}
            onMaxMembersChange={setMaxMembers}
          />

          <DialogFooter className="items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Apagar grupo
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
