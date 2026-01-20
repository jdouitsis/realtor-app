import { type ClientStatus } from '@app/shared/clients'

import { Badge } from '@/components/ui'

interface StatusBadgeProps {
  status: ClientStatus
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge status={status}>{STATUS_LABELS[status]}</Badge>
}
