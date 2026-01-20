import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'

import type { User } from '@/features/auth'
import { queryClient } from '@/lib/query'
import type { RouterContext } from '@/lib/router-context'
import { trpc, trpcClient } from '@/lib/trpc'

const AUTH_ME_QUERY_KEY = getQueryKey(trpc.auth.me, undefined, 'query')

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    // Check cache first to avoid API call on every navigation
    const cached = queryClient.getQueryData<User | null>(AUTH_ME_QUERY_KEY)
    if (cached !== undefined) {
      return { user: cached ?? undefined }
    }

    // No cache - fetch and populate the cache
    const user = await trpcClient.auth.me.query()
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, user)
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
