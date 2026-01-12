import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
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
      <div className="flex flex-col items-center justify-center h-full">
        <PageHeader />
        <Loader2 className="animate-spin m-auto" />
      </div>
    )
  }

  if (profileQuery.error || !profile) {
    const parsed = parseError(profileQuery.error)
    console.error(parsed)
    return (
      <>
        <PageHeader />
        <p className="text-destructive">Failed to load profile</p>
        <p className="text-destructive">{parsed.userMessage}</p>
        <p className="text-destructive">Request ID: {parsed.requestId}</p>
      </>
    )
  }

  return (
    <>
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
    </>
  )
}

function PageHeader() {
  return (
    <div className="mb-6 w-full">
      <h1 className="text-3xl font-bold">Profile</h1>
    </div>
  )
}
