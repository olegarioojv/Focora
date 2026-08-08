import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface InvitePanelProps {
  groupName: string
  inviteCode: string
}

export function InvitePanel({ groupName, inviteCode }: InvitePanelProps) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${window.location.origin}/app/convite/${inviteCode}`
  const shareText = `Vem estudar comigo no grupo "${groupName}" no Focora! Entra com o código ${inviteCode} ou pelo link: ${inviteUrl}`

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  async function shareGeneric() {
    if (navigator.share) {
      try {
        await navigator.share({ title: groupName, text: shareText, url: inviteUrl })
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return
    }
    await navigator.clipboard.writeText(shareText)
    toast.success('Mensagem de convite copiada — cole no Discord ou onde quiser')
  }

  return (
    <Card className="border border-border p-5">
      <h3 className="font-heading text-base font-medium">Convidar pessoas</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Compartilhe o código ou o link para outras pessoas entrarem no grupo.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="flex-1 rounded-lg border border-dashed border-border px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest text-foreground">
          {inviteCode}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copyLink}>
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-success hover:text-success"
          onClick={shareWhatsApp}
        >
          WhatsApp
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={shareGeneric}>
          <Share2 className="h-3.5 w-3.5" />
          Compartilhar (Discord e outros)
        </Button>
      </div>
    </Card>
  )
}
