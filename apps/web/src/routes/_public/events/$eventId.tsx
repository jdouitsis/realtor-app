import { createFileRoute } from '@tanstack/react-router'

import { EventDetailPage } from '@/features/events'

export const Route = createFileRoute('/_public/events/$eventId')({
  component: EventDetailPage,
})
