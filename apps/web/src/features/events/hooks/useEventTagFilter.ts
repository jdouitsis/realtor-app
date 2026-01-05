import { getRouteApi } from '@tanstack/react-router'

import { EVENT_TAGS } from './useEvents'

const routeApi = getRouteApi('/_public/events/')

/**
 * Hook for managing event tag filters via URL search params.
 *
 * @example
 * const { filterByTags, toggleTag, isSelected } = useEventTagFilter()
 * const filteredEvents = allEvents.filter(filterByTags)
 */
export function useEventTagFilter() {
  const { tags: selectedTags = [] } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  const toggleTag = (tagValue: string) => {
    const newTags = selectedTags.includes(tagValue)
      ? selectedTags.filter((t) => t !== tagValue)
      : [...selectedTags, tagValue]

    void navigate({
      search: newTags.length > 0 ? { tags: newTags } : {},
    })
  }

  const isSelected = (tagValue: string) => selectedTags.includes(tagValue)

  const clearAll = () => {
    void navigate({ search: {} })
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
