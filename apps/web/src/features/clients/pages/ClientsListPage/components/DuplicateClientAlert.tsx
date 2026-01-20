import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui'

interface DuplicateClientAlertProps {
  email: string
  onViewProfile: () => void
}

export function DuplicateClientAlert({ email, onViewProfile }: DuplicateClientAlertProps) {
  return (
    <div className="rounded-lg border border-alert-warning-border bg-alert-warning-bg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-alert-warning-text" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-alert-warning-heading">
            This client is already in your list
          </p>
          <p className="text-sm text-alert-warning-text">
            <span className="font-medium">{email}</span> is already one of your clients.
          </p>
          <Button variant="outline" size="sm" onClick={onViewProfile}>
            View Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
