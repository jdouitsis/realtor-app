import { useNavigate, useSearch } from '@tanstack/react-router'

import { EVENT_TAGS } from './events'

/**
 * Hook for managing event tag filters via URL search params.
 *
 * @example
 * const { filterByTags, toggleTag, isSelected } = useEventTagFilter()
 * const filteredEvents = allEvents.filter(filterByTags)
 */
export function useEventTagFilter() {
  const search = useSearch({ strict: false })
  const selectedTags = (search as { tags?: string[] }).tags ?? []
  const navigate = useNavigate()

  const toggleTag = (tagValue: string) => {
    const newTags = selectedTags.includes(tagValue)
      ? selectedTags.filter((t) => t !== tagValue)
      : [...selectedTags, tagValue]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newSearch: any = newTags.length > 0 ? { tags: newTags } : {}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    void navigate({ search: newSearch })
  }

  const isSelected = (tagValue: string) => selectedTags.includes(tagValue)

  const clearAll = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emptySearch: any = {}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    void navigate({ search: emptySearch })
  }

  const filterByTags = (event: { tags: string[] }) =>
    selectedTags.length === 0 || event.tags.some((tag) => selectedTags.includes(tag))

  return {
    selectedTags,
    toggleTag,
    isSelected,
    clearAll,
    filterByTags,
    availableTags: EVENT_TAGS,
  }
}
