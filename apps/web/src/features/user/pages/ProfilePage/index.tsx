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
        <h1 className="text-3xl font-bold mb-6 mr-auto">Profile</h1>
        <p className="text-muted-foreground">Loading...</p>
      </>
    )
  }

  if (profileQuery.error || !profile) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-6 mr-auto">Profile</h1>
        <p className="text-destructive">Failed to load profile</p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 mr-auto">Profile</h1>
      <div className="space-y-6 w-full">
        <ProfileForm initialName={profile.name} onSuccess={handleProfileUpdate} />

        <EmailChangeSection
          currentEmail={profile.email}
          pendingEmail={profile.pendingEmail}
          onSuccess={handleProfileUpdate}
        />
        <SessionsSection />
        <DeleteAccountSection userEmail={profile.email} />
      </div>
    </>
  )
}
