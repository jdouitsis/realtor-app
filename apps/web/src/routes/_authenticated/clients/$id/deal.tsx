import { createFileRoute } from '@tanstack/react-router'

import { DealTab } from '@/features/clients/pages/ClientProfilePage/tabs'

export const Route = createFileRoute('/_authenticated/clients/$id/deal')({
  component: DealTab,
})
