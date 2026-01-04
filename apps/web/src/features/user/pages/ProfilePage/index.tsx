import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { DeleteAccountSection } from './components/DeleteAccountSection'
import { EmailChangeSection } from './components/EmailChangeSection'
import { ProfileForm } from './components/ProfileForm'
import { SessionsSection } from './components/SessionsSection'

export function ProfilePage() {
  const profileQuery = trpc.user.getProfile.useQuery()
  const utils = trpc.useUtils()

  const profile = profileQuery.data

  const handleProfileUpdate = () => {
    void utils.user.getProfile.invalidate()
  }

  if (profileQuery.isLoading) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-6 mr-auto">Settings</h1>
        <p className="text-muted-foreground">Loading...</p>
      </>
    )
  }

  if (profileQuery.error || !profile) {
    const parsed = parseError(profileQuery.error)
    console.error(parsed)
    return (
      <>
        <h1 className="text-3xl font-bold mb-6 mr-auto">Settings</h1>
        <p className="text-destructive">Failed to load profile</p>
        <p className="text-destructive">{parsed.userMessage}</p>
        <p className="text-destructive">Request ID: {parsed.requestId}</p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 mr-auto">Settings</h1>
      <Tabs defaultValue="general" className="w-full">
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
