import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import type { RouterContext } from '@/lib/router-context'
import { trpcClient } from '@/lib/trpc'

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const user = await trpcClient.auth.me.query()
    return { user: user ?? undefined }
  },
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools />
    </>
  )
}
