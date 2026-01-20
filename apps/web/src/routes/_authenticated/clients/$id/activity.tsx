import { createFileRoute } from '@tanstack/react-router'

import { ActivityTab } from '@/features/clients/pages/ClientProfilePage/tabs'

export const Route = createFileRoute('/_authenticated/clients/$id/activity')({
  component: ActivityTabRoute,
})

function ActivityTabRoute() {
  const { id } = Route.useParams()
  return <ActivityTab clientId={id} />
}
