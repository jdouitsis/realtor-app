import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui'

type ClientStatus = 'invited' | 'active' | 'inactive'

interface StatusChangeButtonProps {
  currentStatus: ClientStatus
  onToggle: () => void
  isLoading: boolean
}

export function StatusChangeButton({
  currentStatus,
  onToggle,
  isLoading,
}: StatusChangeButtonProps) {
  if (currentStatus === 'invited') {
    return null
  }

  const label = currentStatus === 'active' ? 'Mark as Inactive' : 'Mark as Active'

  return (
    <Button
      variant={currentStatus === 'active' ? 'outline' : 'default'}
      className="w-full"
      onClick={onToggle}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  )
}
