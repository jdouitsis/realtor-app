import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

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
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Outlet />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          {/* <TanStackRouterDevtools /> */}
        </>
      )}
    </>
  )
}
