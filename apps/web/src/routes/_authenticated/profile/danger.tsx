import { createFileRoute } from '@tanstack/react-router'

import { DangerTab } from '@/features/user'

export const Route = createFileRoute('/_authenticated/profile/danger')({
  component: DangerTab,
})
