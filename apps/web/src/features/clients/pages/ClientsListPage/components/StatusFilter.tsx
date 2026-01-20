import { CLIENT_STATUSES, type ClientStatus } from '@app/shared/clients'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StatusFilterProps {
  selectedStatuses: ClientStatus[]
  onToggle: (status: ClientStatus) => void
}

/**
 * Status configuration mapping each status to its visual styling.
 * Uses semantic tokens: status-active, status-invited, status-inactive.
 */
const STATUS_CONFIG: Record<
  ClientStatus,
  {
    label: string
    selectedBg: string
    selectedText: string
    selectedBorder: string
    hoverBg: string
  }
> = {
  active: {
    label: 'Active',
    selectedBg: 'bg-status-active/15',
    selectedText: 'text-status-active-text',
    selectedBorder: 'border-status-active/30',
    hoverBg: 'hover:bg-status-active/10',
  },
  invited: {
    label: 'Invited',
    selectedBg: 'bg-status-invited/15',
    selectedText: 'text-status-invited-text',
    selectedBorder: 'border-status-invited/30',
    hoverBg: 'hover:bg-status-invited/10',
  },
  inactive: {
    label: 'Inactive',
    selectedBg: 'bg-status-inactive/15',
    selectedText: 'text-status-inactive-text',
    selectedBorder: 'border-status-inactive/30',
    hoverBg: 'hover:bg-status-inactive/10',
  },
}

export function StatusFilter({ selectedStatuses, onToggle }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground mr-1">Filter:</span>
      {CLIENT_STATUSES.map((status) => (
        <StatusChip
          key={status}
          status={status}
          isSelected={selectedStatuses.includes(status)}
          onToggle={() => onToggle(status)}
        />
      ))}
    </div>
  )
}

interface StatusChipProps {
  status: ClientStatus
  isSelected: boolean
  onToggle: () => void
}

function StatusChip({ status, isSelected, onToggle }: StatusChipProps) {
  const config = STATUS_CONFIG[status]

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? [config.selectedBg, config.selectedText, config.selectedBorder]
          : [
              'bg-transparent border-border/60 text-muted-foreground',
              config.hoverBg,
              'hover:border-border',
            ]
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all duration-150',
          isSelected
            ? [
                config.selectedBg,
                config.selectedText,
                'ring-1',
                config.selectedBorder.replace('border-', 'ring-'),
              ]
            : 'bg-muted/50 ring-1 ring-border/50'
        )}
      >
        {isSelected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
      </span>
      {config.label}
    </button>
  )
}
