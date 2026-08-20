import { useEffect } from 'react'

interface UseKeyboardShortcutOptions {
  ctrlOrCmd?: boolean
}

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: UseKeyboardShortcutOptions = {},
) {
  const { ctrlOrCmd = true } = options

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const modifierOk = ctrlOrCmd ? event.metaKey || event.ctrlKey : true
      if (modifierOk && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler, ctrlOrCmd])
}
