import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
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
import { GROUP_ICONS } from '@/utils/group-icons'
import { groupsApi, type GroupDetail, type GroupType } from '@/services/groups-api'
import { ApiError } from '@/services/api-client'

interface CreateGroupModalProps {
  trigger: ReactNode
  onCreated: (group: GroupDetail) => void
}

export function CreateGroupModal({ trigger, onCreated }: CreateGroupModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string>(GROUP_ICONS[0])
  const [type, setType] = useState<GroupType>('private')
  const [maxMembers, setMaxMembers] = useState(20)

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
    setIcon(GROUP_ICONS[0])
    setType('private')
    setMaxMembers(20)
  }, [open])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('Dê um nome para o grupo')
      return
    }

    setSubmitting(true)
    try {
      const group = await groupsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        type,
        maxMembers,
      })
      toast.success('Grupo criado!')
      setOpen(false)
      onCreated(group)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível criar o grupo',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo grupo de estudos</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <GroupFormFields
            idPrefix="group"
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

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar grupo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
