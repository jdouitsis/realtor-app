import { CLIENT_STATUSES, type ClientStatus } from '@app/shared/clients'

import { Button } from '@/components/ui'

interface StatusFilterProps {
  selectedStatuses: ClientStatus[]
  onToggle: (status: ClientStatus) => void
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  invited: 'Invited',
  active: 'Active',
  inactive: 'Inactive',
}

export function StatusFilter({ selectedStatuses, onToggle }: StatusFilterProps) {
  return (
    <div className="flex gap-1">
      {CLIENT_STATUSES.map((status) => {
        const isSelected = selectedStatuses.includes(status)
        return (
          <Button
            key={status}
            variant="ghost"
            size="sm"
            onClick={() => onToggle(status)}
            className={
              isSelected
                ? 'border border-input bg-background shadow-sm'
                : 'border border-transparent'
            }
          >
            {STATUS_LABELS[status]}
          </Button>
        )
      })}
    </div>
  )
}
