import { createFileRoute } from '@tanstack/react-router'

import { DealTab } from '@/features/clients/pages/ClientProfilePage/tabs'

export const Route = createFileRoute('/_authenticated/clients/$id/deals')({
  component: DealTabRoute,
})

function DealTabRoute() {
  const { id } = Route.useParams()
  return <DealTab clientId={id} />
}
