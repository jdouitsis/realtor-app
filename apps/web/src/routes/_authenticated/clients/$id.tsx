import { createFileRoute } from '@tanstack/react-router'

import { ClientProfilePage } from '@/features/clients'

export const Route = createFileRoute('/_authenticated/clients/$id')({
  component: ClientProfilePage,
})
