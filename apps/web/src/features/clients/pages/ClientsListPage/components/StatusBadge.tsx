import { Badge } from '@/components/ui'

export type ClientStatus = 'invited' | 'active' | 'inactive'

interface StatusBadgeProps {
  status: ClientStatus
}

const statusConfig: Record<
  ClientStatus,
  { label: string; variant: 'warning' | 'success' | 'muted' }
> = {
  invited: { label: 'Invited', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
