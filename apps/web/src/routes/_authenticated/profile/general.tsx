import { createFileRoute } from '@tanstack/react-router'

import { GeneralTab } from '@/features/user'

export const Route = createFileRoute('/_authenticated/profile/general')({
  component: GeneralTab,
})
