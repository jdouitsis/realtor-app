import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { ArtifactsPage } from '@/features/artifacts'

const searchSchema = z.object({
  clientId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/artifacts')({
  validateSearch: searchSchema,
  component: ArtifactsPageRoute,
})

function ArtifactsPageRoute() {
  const { clientId } = Route.useSearch()
  return <ArtifactsPage clientId={clientId} />
}
