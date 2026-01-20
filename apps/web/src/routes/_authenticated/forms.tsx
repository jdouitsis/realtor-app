import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { FormsPage } from '@/features/forms'

const searchSchema = z.object({
  clientId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/forms')({
  validateSearch: searchSchema,
  component: FormsPageRoute,
})

function FormsPageRoute() {
  const { clientId } = Route.useSearch()
  return <FormsPage clientId={clientId} />
}
