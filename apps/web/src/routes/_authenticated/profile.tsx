import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { ProfilePage } from '@/features/user'

const profileSearchSchema = z.object({
  tab: z.enum(['general', 'sessions', 'danger']).optional(),
})

export const Route = createFileRoute('/_authenticated/profile')({
  validateSearch: profileSearchSchema,
  component: ProfilePage,
})
