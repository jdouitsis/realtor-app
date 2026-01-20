import { AlertCircle } from 'lucide-react'

import { Button, Skeleton } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { DeleteAccountSection } from '../components/DeleteAccountSection'

export function DangerTab() {
  const profileQuery = trpc.user.getProfile.useQuery()

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-lg border border-destructive/50 overflow-hidden">
        <div className="border-b border-destructive/30 px-4 py-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    )
  }

  if (profileQuery.error || !profileQuery.data) {
    const parsed = parseError(profileQuery.error)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">Failed to load profile</h3>
        <p className="text-sm text-muted-foreground mb-6">{parsed.userMessage}</p>
        <Button variant="outline" size="sm" onClick={() => void profileQuery.refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return <DeleteAccountSection userEmail={profileQuery.data.email} />
}
