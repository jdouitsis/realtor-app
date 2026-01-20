import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { ActivityPage } from '@/features/activity'

const searchSchema = z.object({
  clientId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/activity')({
  validateSearch: searchSchema,
  component: ActivityPageRoute,
})

function ActivityPageRoute() {
  const { clientId } = Route.useSearch()
  return <ActivityPage clientId={clientId} />
}
