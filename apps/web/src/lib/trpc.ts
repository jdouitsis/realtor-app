import type { AppRouter } from '@app/server/trpc'
import { createTRPCReact, httpBatchLink, loggerLink } from '@trpc/react-query'

import { getStorage } from './storage'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    // Log all requests/responses in development for easy debugging
    loggerLink({
      enabled: () => import.meta.env.DEV,
    }),
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,
      headers() {
        const token = getStorage('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})
