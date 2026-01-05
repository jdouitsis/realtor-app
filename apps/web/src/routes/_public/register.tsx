import { createFileRoute, redirect } from '@tanstack/react-router'

import { RegisterPage } from '@/features/auth'

export const Route = createFileRoute('/_public/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})
