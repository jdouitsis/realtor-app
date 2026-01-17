import { getRouteApi } from '@tanstack/react-router'
import { AlertCircle, Loader2 } from 'lucide-react'

import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
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
        <Card className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </Card>
      </div>
    )
  }

  if (profileQuery.error || !profile) {
    const parsed = parseError(profileQuery.error)
    console.error(parsed)
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <p className="font-medium mb-1">Failed to load profile</p>
          <p className="text-sm text-muted-foreground mb-4">{parsed.userMessage}</p>
          <Button variant="outline" onClick={() => void profileQuery.refetch()}>
            Try again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
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
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
    </div>
  )
}
