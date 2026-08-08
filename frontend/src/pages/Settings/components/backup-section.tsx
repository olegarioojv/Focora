import { useRef, type ChangeEvent } from 'react'
import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportBackup, importBackup } from '@/utils/backup'

export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    exportBackup()
    toast.success('Backup exportado')
  }

  async function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importBackup(file)
      toast.success('Backup restaurado. Recarregando...')
      setTimeout(() => window.location.reload(), 800)
    } catch {
      toast.error('Arquivo de backup inválido')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <Card className="border border-border p-6">
      <h3 className="font-heading text-base font-medium">Backup</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Exporte todos os seus dados (matérias, cronograma, revisões, XP) em
        um arquivo, ou restaure a partir de um backup anterior.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar backup
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Importar backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => void handleImportChange(event)}
        />
      </div>
    </Card>
  )
}
