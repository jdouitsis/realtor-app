import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { ClientsListPage } from '@/features/clients'

const clientsSearchSchema = z.object({
  status: z.enum(['invited', 'active', 'inactive']).optional(),
})

export const Route = createFileRoute('/_authenticated/clients/')({
  validateSearch: clientsSearchSchema,
  component: ClientsListPage,
})
