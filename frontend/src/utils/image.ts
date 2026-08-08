const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB

export function fileToResizedDataUrl(
  file: File,
  maxSize = 256,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Rejected before ever reading the file — readAsDataURL loads the
    // whole original file into memory regardless of the eventual
    // (much smaller) resized output, so an unbounded upload can feel
    // like a hang with zero feedback on a slower device.
    if (file.size > MAX_FILE_SIZE_BYTES) {
      reject(new Error('Imagem muito grande — escolha um arquivo de até 15MB.'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const width = Math.round(img.width * scale)
        const height = Math.round(img.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas não suportado.'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
