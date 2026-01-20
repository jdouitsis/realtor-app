import { createFileRoute } from '@tanstack/react-router'

import { FormsTab } from '@/features/clients/pages/ClientProfilePage/tabs'

export const Route = createFileRoute('/_authenticated/clients/$id/forms')({
  component: FormsTab,
})
