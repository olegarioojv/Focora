import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="text-lg font-semibold text-foreground">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Button type="button" asChild className="mt-2">
        <Link to="/app">Voltar para o início</Link>
      </Button>
    </div>
  )
}
