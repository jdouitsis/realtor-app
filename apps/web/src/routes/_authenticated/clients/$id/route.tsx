import { createFileRoute } from '@tanstack/react-router'

import { ClientProfileLayout } from '@/features/clients/pages/ClientProfilePage'

export const Route = createFileRoute('/_authenticated/clients/$id')({
  component: ClientProfilePage,
})

function ClientProfilePage() {
  const { id } = Route.useParams()
  return <ClientProfileLayout clientId={id} />
}
