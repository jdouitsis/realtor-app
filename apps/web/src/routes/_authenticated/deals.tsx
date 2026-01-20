import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { DealsPage } from '@/features/deals'

const searchSchema = z.object({
  clientId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/deals')({
  validateSearch: searchSchema,
  component: DealsPageRoute,
})

function DealsPageRoute() {
  const { clientId } = Route.useSearch()
  return <DealsPage clientId={clientId} />
}
