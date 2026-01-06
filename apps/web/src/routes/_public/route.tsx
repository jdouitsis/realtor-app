import { createFileRoute, getRouteApi, Outlet } from '@tanstack/react-router'

import { NavBar } from '@/components/common/NavBar'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

const routeApi = getRouteApi('/_public')

function PublicLayout() {
  const { user } = routeApi.useRouteContext()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar user={user} />
      <main className="flex flex-1 flex-col px-4 py-6 md:px-6">
        <div className="mx-auto flex flex-1 flex-col w-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
