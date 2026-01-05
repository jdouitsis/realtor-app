import { Filter } from 'lucide-react'

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'

import { useEventTagFilter } from '../../../hooks/useEventTagFilter'

export function EventTagFilter() {
  const { selectedTags, toggleTag, isSelected, clearAll, availableTags } = useEventTagFilter()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {selectedTags.length > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {selectedTags.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center justify-between">
          Categories
          {selectedTags.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag.value}
            checked={isSelected(tag.value)}
            onCheckedChange={() => toggleTag(tag.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {tag.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
