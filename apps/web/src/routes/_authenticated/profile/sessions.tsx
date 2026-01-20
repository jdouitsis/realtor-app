import { createFileRoute } from '@tanstack/react-router'

import { SessionsTab } from '@/features/user'

export const Route = createFileRoute('/_authenticated/profile/sessions')({
  component: SessionsTab,
})
