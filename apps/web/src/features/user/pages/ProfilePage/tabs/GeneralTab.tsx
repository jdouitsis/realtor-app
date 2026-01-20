import { AlertCircle } from 'lucide-react'

import { Button, Skeleton } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { EmailChangeSection } from '../components/EmailChangeSection'
import { ProfileForm } from '../components/ProfileForm'

export function GeneralTab() {
  const profileQuery = trpc.user.getProfile.useQuery()
  const utils = trpc.useUtils()

  const handleProfileUpdate = () => {
    void utils.user.getProfile.invalidate()
  }

  if (profileQuery.isLoading) {
    return <GeneralTabSkeleton />
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

  const profile = profileQuery.data

  return (
    <div className="space-y-6">
      <ProfileForm initialName={profile.name} onSuccess={handleProfileUpdate} />
      <EmailChangeSection
        currentEmail={profile.email}
        pendingEmail={profile.pendingEmail}
        onSuccess={handleProfileUpdate}
      />
    </div>
  )
}

function GeneralTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* ProfileForm skeleton */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <div className="border-b border-border/50 px-4 py-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
      {/* EmailChangeSection skeleton */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <div className="border-b border-border/50 px-4 py-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
}
