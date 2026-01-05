import { createFileRoute, getRouteApi, Outlet, redirect } from '@tanstack/react-router'

import { NavBar } from '@/components/common/NavBar'
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

const routeApi = getRouteApi('/_authenticated')

function AuthenticatedLayout() {
  const { user } = routeApi.useRouteContext()

  return (
    <div className="flex h-full w-full flex-col">
      <NavBar user={user} />
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto h-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
