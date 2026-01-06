import { useStorage } from '@/lib/storage'

import type { NewsletterPreferences } from '../../../types/newsletter.types'
import { DEFAULT_NEWSLETTER_PREFERENCES } from '../../../types/newsletter.types'

/**
 * Hook for managing newsletter preferences stored in localStorage.
 *
 * @example
 * const { preferences, updatePreferences, resetPreferences } = useNewsletterPreferences()
 */
export function useNewsletterPreferences() {
  const [stored, setStored, clear] = useStorage('newsletter_preferences')

  const preferences = stored ?? DEFAULT_NEWSLETTER_PREFERENCES

  const updatePreferences = (updates: Partial<NewsletterPreferences>) => {
    setStored({ ...preferences, ...updates })
  }

  const resetPreferences = () => clear()

  return { preferences, updatePreferences, resetPreferences }
}
