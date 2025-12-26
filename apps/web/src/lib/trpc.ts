import { createTRPCReact, httpBatchLink } from '@trpc/react-query'

import type { AppRouter } from '@finance/server/trpc'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,
    }),
  ],
})
