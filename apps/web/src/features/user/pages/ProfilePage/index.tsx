import { getRouteApi } from '@tanstack/react-router'
import { AlertCircle, Settings, Shield, User } from 'lucide-react'

import { Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { DeleteAccountSection } from './components/DeleteAccountSection'
import { EmailChangeSection } from './components/EmailChangeSection'
import { ProfileForm } from './components/ProfileForm'
import { SessionsSection } from './components/SessionsSection'

const routeApi = getRouteApi('/_authenticated/profile')

export function ProfilePage() {
  const { tab } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const profileQuery = trpc.user.getProfile.useQuery()
  const utils = trpc.useUtils()

  const profile = profileQuery.data
  const currentTab = tab ?? 'general'

  const handleTabChange = (value: string) => {
    void navigate({
      search: value === 'general' ? {} : { tab: value as 'sessions' | 'danger' },
    })
  }

  const handleProfileUpdate = () => {
    void utils.user.getProfile.invalidate()
  }

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <ProfileLoadingSkeleton />
      </div>
    )
  }

  if (profileQuery.error || !profile) {
    const parsed = parseError(profileQuery.error)
    console.error(parsed)
    return (
      <div className="space-y-6">
        <PageHeader />
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" strokeWidth={1.5} />
            General
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Shield className="h-4 w-4" strokeWidth={1.5} />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2">
            <Settings className="h-4 w-4" strokeWidth={1.5} />
            Danger
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6 mt-6">
          <ProfileForm initialName={profile.name} onSuccess={handleProfileUpdate} />
          <EmailChangeSection
            currentEmail={profile.email}
            pendingEmail={profile.pendingEmail}
            onSuccess={handleProfileUpdate}
          />
        </TabsContent>
        <TabsContent value="sessions" className="mt-6">
          <SessionsSection />
        </TabsContent>
        <TabsContent value="danger" className="mt-6">
          <DeleteAccountSection userEmail={profile.email} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
    </div>
  )
}

function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      {/* Content skeleton - matches ProfileForm structure */}
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
      {/* Second card skeleton - matches EmailChangeSection structure */}
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
