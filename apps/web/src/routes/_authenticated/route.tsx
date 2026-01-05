import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Header } from '@/components/common/Header'
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

function AuthenticatedLayout() {
  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto h-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
