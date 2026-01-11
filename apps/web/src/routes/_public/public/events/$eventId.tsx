import { createFileRoute, redirect } from '@tanstack/react-router'

import { EventDetailPage } from '@/features/events'

export const Route = createFileRoute('/_public/public/events/$eventId')({
  beforeLoad: ({ context, params }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/events/$eventId', params })
    }
  },
  component: EventDetailPage,
})
