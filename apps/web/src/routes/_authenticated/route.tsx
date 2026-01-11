import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthenticatedLayout } from '@/features/shell'
import { clearStorage } from '@/lib/storage'
import { trpcClient } from '@/lib/trpc'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const user = await trpcClient.auth.me.query()
    if (!context.auth.isAuthenticated || !user) {
      clearStorage('auth_token')
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
    return { user }
  },
  component: AuthenticatedLayout,
})
