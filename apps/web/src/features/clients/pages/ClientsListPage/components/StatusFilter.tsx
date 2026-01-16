import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type Status = 'invited' | 'active' | 'inactive'

interface StatusFilterProps {
  selectedStatuses: Status[]
  onToggle: (status: Status) => void
}

const filterOptions: { value: Status; label: string }[] = [
  { value: 'invited', label: 'Invited' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function StatusFilter({ selectedStatuses, onToggle }: StatusFilterProps) {
  return (
    <div className="flex gap-1">
      {filterOptions.map((option) => {
        const isSelected = selectedStatuses.includes(option.value)
        return (
          <Button
            key={option.value}
            variant={isSelected ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onToggle(option.value)}
            className={cn(isSelected && 'bg-secondary')}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
