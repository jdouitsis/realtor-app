import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type FilterStatus = 'all' | 'invited' | 'active' | 'inactive'

interface StatusFilterProps {
  value: FilterStatus
  onChange: (status: FilterStatus) => void
}

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'invited', label: 'Invited' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-1">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(value === option.value && 'bg-secondary')}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
