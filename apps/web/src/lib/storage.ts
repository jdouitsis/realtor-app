/* eslint-disable no-restricted-globals */
import { useCallback, useEffect, useState } from 'react'

import type { User } from '@/features/auth/types/auth.types'

/**
 * Registry mapping storage keys to their value types.
 * Add new keys here to enable type-safe storage access.
 */
interface StorageRegistry {
  auth_user: User
}

type StorageKey = keyof StorageRegistry

/**
 * React hook for type-safe localStorage access with reactive state and cross-tab sync.
 *
 * @example
 * const [user, setUser, clearUser] = useStorage('auth_user')
 */
export function useStorage<K extends StorageKey>(
  key: K
): [value: StorageRegistry[K] | null, set: (value: StorageRegistry[K]) => void, clear: () => void] {
  const [value, setValue] = useState<StorageRegistry[K] | null>(() => {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as StorageRegistry[K]) : null
  })

  // Sync state when localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return
      setValue(event.newValue ? (JSON.parse(event.newValue) as StorageRegistry[K]) : null)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  const set = useCallback(
    (newValue: StorageRegistry[K]) => {
      localStorage.setItem(key, JSON.stringify(newValue))
      setValue(newValue)
    },
    [key]
  )

  const clear = useCallback(() => {
    localStorage.removeItem(key)
    setValue(null)
  }, [key])

  return [value, set, clear]
}
