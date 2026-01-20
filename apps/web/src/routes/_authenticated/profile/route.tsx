import { createFileRoute } from '@tanstack/react-router'

import { ProfilePageLayout } from '@/features/user'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePageLayout,
})
