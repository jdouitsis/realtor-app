import { createFileRoute } from '@tanstack/react-router'

import { LandingPage } from '@/features/public'

export const Route = createFileRoute('/')({
  component: LandingPage,
})
