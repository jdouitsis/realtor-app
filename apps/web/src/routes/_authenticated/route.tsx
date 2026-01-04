import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Header } from '@/components/common/Header'
import { Sidebar } from '@/features/dashboard'
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
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0 w-full">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6 w-full">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
