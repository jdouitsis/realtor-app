import { createFileRoute, redirect } from '@tanstack/react-router'

import { LandingPage } from '@/features/public'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingPage,
})
