import { createFileRoute, getRouteApi, Outlet } from '@tanstack/react-router'

import { NavBar } from '@/components/common/NavBar'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

const routeApi = getRouteApi('/_public')

function PublicLayout() {
  const { user } = routeApi.useRouteContext()

  return (
    <div className="flex min-h-full w-full flex-col">
      <NavBar user={user} />
      <main className="flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto h-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
