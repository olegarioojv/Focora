const BACKUP_PREFIX = 'focora-'

export function exportBackup() {
  const data: Record<string, string> = {}

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key && key.startsWith(BACKUP_PREFIX)) {
      const value = localStorage.getItem(key)
      if (value !== null) data[key] = value
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `focora-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text()
  const data: unknown = JSON.parse(text)

  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid backup file')
  }

  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    if (key.startsWith(BACKUP_PREFIX) && typeof value === 'string') {
      localStorage.setItem(key, value)
    }
  })
}
