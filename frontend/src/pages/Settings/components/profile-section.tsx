import { useRef } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useProfileStore } from '@/stores/profile-store'
import { fileToResizedDataUrl } from '@/utils/image'

export function ProfileSection() {
  const name = useProfileStore((state) => state.name)
  const setName = useProfileStore((state) => state.setName)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const initials = name.slice(0, 2).toUpperCase()

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.')
      return
    }

    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setAvatarUrl(dataUrl)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível carregar a imagem.',
      )
    }
  }

  return (
    <Card className="border border-border p-6">
      <h3 className="font-heading text-base font-medium">Perfil</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            aria-label="Adicionar foto"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Camera className="h-3 w-3" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex max-w-sm flex-1 flex-col gap-1.5">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="profile-name"
          >
            Nome
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="mt-0.5 flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Remover foto
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
