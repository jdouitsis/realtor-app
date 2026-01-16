import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { ClientsListPage } from '@/features/clients'

const statusEnum = z.enum(['invited', 'active', 'inactive'])

const clientsSearchSchema = z.object({
  statuses: z
    .union([z.string(), z.array(statusEnum)])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (Array.isArray(val)) return val
      return val
        .split(',')
        .filter((s): s is z.infer<typeof statusEnum> => statusEnum.safeParse(s).success)
    }),
})

export const Route = createFileRoute('/_authenticated/clients/')({
  validateSearch: clientsSearchSchema,
  component: ClientsListPage,
})
