import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthenticatedLayout } from '@/features/shell'
import { clearStorage } from '@/lib/storage'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // User is already fetched in root route's beforeLoad
    if (!context.auth.isAuthenticated || !context.user) {
      clearStorage('auth_token')
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return { user: context.user }
  },
  component: AuthenticatedLayout,
})
