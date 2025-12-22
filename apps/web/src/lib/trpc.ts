import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import type { AppRouter } from '@finance/server/trpc'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
    }),
  ],
})
