import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '@/features/user'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})
