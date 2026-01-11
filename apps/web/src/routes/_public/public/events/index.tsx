import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { EventsPage } from '@/features/events'

const eventsSearchSchema = z.object({
  tags: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_public/public/events/')({
  validateSearch: eventsSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/events', search })
    }
  },
  component: EventsPage,
})
