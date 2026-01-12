import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { MagicLinkPage } from '@/features/auth'

const magicLinkSearchSchema = z.object({
  token: z.string().length(64),
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_public/login/magic')({
  beforeLoad: ({ context, search }) => {
    // If already authenticated, redirect directly without consuming the magic link
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect ?? '/dashboard' })
    }
  },
  validateSearch: magicLinkSearchSchema,
  component: MagicLinkPage,
})
