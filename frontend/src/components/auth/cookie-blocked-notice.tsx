import { Cookie } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCookieNoticeStore } from '@/stores/cookie-notice-store'

export function CookieBlockedNotice() {
  const open = useCookieNoticeStore((state) => state.open)
  const close = useCookieNoticeStore((state) => state.close)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            Seu navegador bloqueou o login
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            O login foi processado, mas seu navegador recusou guardar a
            sessão — isso acontece porque alguns navegadores (Safari, e uma
            parte dos usuários do Chrome) bloqueiam por padrão cookies vindos
            de outro site, e o Focora ainda depende disso.
          </p>

          <div className="rounded-lg border border-border p-3">
            <p className="mb-1.5 font-medium text-foreground">No Chrome</p>
            <p>
              Menu (⋮) → Configurações → Privacidade e segurança → Cookies de
              terceiros → escolha "Permitir" (ou adicione uma exceção para
              focora-eight.vercel.app).
            </p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="mb-1.5 font-medium text-foreground">No Safari (iPhone/iPad/Mac)</p>
            <p>
              Ajustes → Safari → Privacidade e Segurança → desative "Impedir
              Rastreamento entre Sites".
            </p>
          </div>

          <p>
            Depois de ajustar, feche esta janela e tente entrar de novo. Se
            estiver usando o link dentro do WhatsApp/Instagram, abra no
            navegador de verdade primeiro (menu ⋮ → "Abrir no navegador").
          </p>
        </div>

        <Button type="button" onClick={close} className="mt-1">
          Entendi
        </Button>
      </DialogContent>
    </Dialog>
  )
}
