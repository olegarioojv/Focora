import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GROUP_ICONS } from '@/utils/group-icons'
import type { GroupType } from '@/services/groups-api'

interface GroupFormFieldsProps {
  idPrefix: string
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  icon: string
  onIconChange: (value: string) => void
  type: GroupType
  onTypeChange: (value: GroupType) => void
  maxMembers: number
  onMaxMembersChange: (value: number) => void
}

export function GroupFormFields({
  idPrefix,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  icon,
  onIconChange,
  type,
  onTypeChange,
  maxMembers,
  onMaxMembersChange,
}: GroupFormFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Ícone</span>
        <div className="flex flex-wrap gap-1.5">
          {GROUP_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onIconChange(emoji)}
              aria-label={`Ícone ${emoji}`}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border text-lg',
                icon === emoji
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent',
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={`${idPrefix}-name`}
        >
          Nome
        </label>
        <Input
          id={`${idPrefix}-name`}
          placeholder="Ex: Guerreiros do Foco"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={`${idPrefix}-description`}
        >
          Descrição
        </label>
        <Input
          id={`${idPrefix}-description`}
          placeholder="Sobre o que é esse grupo?"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Tipo</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onTypeChange('private')}
            className={cn(
              'flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium',
              type === 'private'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-accent',
            )}
          >
            Privado
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('public')}
            className={cn(
              'flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium',
              type === 'public'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground hover:bg-accent',
            )}
          >
            Público
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {type === 'private'
            ? 'Só entra quem tiver o link ou código de convite.'
            : 'Aparece na busca — qualquer um pode encontrar e entrar.'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={`${idPrefix}-max-members`}
        >
          Máximo de participantes
        </label>
        <Input
          id={`${idPrefix}-max-members`}
          type="number"
          min={2}
          max={200}
          value={maxMembers}
          onChange={(event) => onMaxMembersChange(Number(event.target.value))}
        />
      </div>
    </>
  )
}
