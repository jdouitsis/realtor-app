import { Checkbox, Label } from '@/components/ui'
import { EVENT_TAGS } from '@/features/events/hooks/events'

interface TagSelectorProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  disabled?: boolean
}

export function TagSelector({ selectedTags, onTagToggle, disabled }: TagSelectorProps) {
  return (
    <div className="space-y-3">
      {EVENT_TAGS.map((tag) => (
        <div key={tag.value} className="flex items-center gap-2">
          <Checkbox
            id={`tag-${tag.value}`}
            checked={selectedTags.includes(tag.value)}
            onCheckedChange={() => onTagToggle(tag.value)}
            disabled={disabled}
          />
          <Label
            htmlFor={`tag-${tag.value}`}
            className={disabled ? 'text-muted-foreground' : undefined}
          >
            {tag.label}
          </Label>
        </div>
      ))}
    </div>
  )
}
