import { useCallback, useState } from 'react'

import { getStorage, setStorage } from '@/lib/storage'

/**
 * Hook for managing sidebar collapsed state with localStorage persistence.
 *
 * @example
 * const [isCollapsed, toggleCollapsed] = useSidebarCollapsed()
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [isCollapsed, setIsCollapsed] = useState(() => getStorage('sidebar_collapsed') ?? false)

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      setStorage('sidebar_collapsed', next)
      return next
    })
  }, [])

  return [isCollapsed, toggleCollapsed]
}
