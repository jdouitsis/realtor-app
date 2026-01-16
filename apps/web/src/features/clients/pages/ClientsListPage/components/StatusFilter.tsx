import { Button } from '@/components/ui'

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
            variant="ghost"
            size="sm"
            onClick={() => onToggle(option.value)}
            className={
              isSelected
                ? 'border border-input bg-background shadow-sm'
                : 'border border-transparent'
            }
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
