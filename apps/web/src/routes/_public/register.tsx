import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod/v4'

import { RegisterPage } from '@/features/auth'

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_public/register')({
  validateSearch: registerSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect ?? '/dashboard' })
    }
  },
  component: RegisterPage,
})
