import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { groupsApi, type GroupInvitePreview } from '@/services/groups-api'
import { ApiError } from '@/services/api-client'

export function GroupInvitePage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [preview, setPreview] = useState<GroupInvitePreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!code) return
    groupsApi
      .previewInvite(code)
      .then(setPreview)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : 'Convite inválido ou expirado',
        ),
      )
      .finally(() => setLoading(false))
  }, [code])

  async function handleJoin() {
    if (!code) return
    setJoining(true)
    try {
      const { id } = await groupsApi.join(code)
      toast.success('Você entrou no grupo!')
      navigate(`/app/grupos/${id}`)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível entrar no grupo',
      )
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border border-border p-6 text-center">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando convite...</p>
        ) : error || !preview ? (
          <>
            <p className="text-sm font-medium text-foreground">
              {error ?? 'Convite inválido ou expirado'}
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/app/grupos">Ver meus grupos</Link>
            </Button>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-4xl">
              {preview.icon}
            </span>
            <h1 className="mt-3 text-lg font-semibold text-foreground">
              {preview.name}
            </h1>
            {preview.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {preview.description}
              </p>
            )}
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {preview.memberCount}/{preview.maxMembers} participantes
            </p>
            <Button
              type="button"
              className="mt-5 w-full"
              disabled={joining}
              onClick={handleJoin}
            >
              {joining ? 'Entrando...' : 'Entrar no grupo'}
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
