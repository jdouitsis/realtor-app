import { createTRPCReact } from '@trpc/react-query'

// TODO: Import AppRouter type from apps/server when it's set up
// import type { AppRouter } from '@finance/server/trpc'

// Placeholder type until server is set up
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppRouter = any

export const trpc = createTRPCReact<AppRouter>()

// tRPC client configuration will be added when server is set up
// Example usage:
//
// import { httpBatchLink } from '@trpc/client'
//
// export const trpcClient = trpc.createClient({
//   links: [
//     httpBatchLink({
//       url: 'http://localhost:3000/trpc',
//     }),
//   ],
// })
