import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { LoginPage } from '@/features/auth'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_public/login')({
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect ?? '/events' })
    }
  },
  validateSearch: loginSearchSchema,
  component: LoginPage,
})
