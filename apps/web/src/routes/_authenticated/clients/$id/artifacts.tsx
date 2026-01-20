import { createFileRoute } from '@tanstack/react-router'

import { DetailsTab } from '@/features/clients/pages/ClientProfilePage/tabs'

export const Route = createFileRoute('/_authenticated/clients/$id/artifacts')({
  component: DetailsTabRoute,
})

function DetailsTabRoute() {
  const { id } = Route.useParams()
  return <DetailsTab clientId={id} />
}
