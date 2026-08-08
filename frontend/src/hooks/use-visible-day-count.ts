import { useEffect, useState } from 'react'

/** Number of carousel columns that comfortably fit the viewport:
 * 2 on phones, 3 on small tablets, 5 from desktop up. */
export function useVisibleDayCount() {
  const [count, setCount] = useState(() => getCountForWidth(
    typeof window === 'undefined' ? 1024 : window.innerWidth,
  ))

  useEffect(() => {
    function handleResize() {
      setCount(getCountForWidth(window.innerWidth))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return count
}

function getCountForWidth(width: number) {
  if (width < 480) return 2
  if (width < 768) return 3
  return 5
}
