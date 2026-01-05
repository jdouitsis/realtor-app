import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet, ScrollRestoration } from '@tanstack/react-router'
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
      <ScrollRestoration />
      <Outlet />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools />
        </>
      )}
    </>
  )
}
