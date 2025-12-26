import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { TRPCClientError } from '@trpc/client'

import { parseError } from './errors'

/** Shape of tRPC error data for retry logic */
interface TRPCErrorData {
  code?: string
}

/** Extracts error info for logging */
function getErrorInfo(error: unknown) {
  const parsed = parseError(error)
  return {
    message: parsed.debugMessage,
    code: parsed.code,
    requestId: parsed.requestId,
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on auth errors - user needs to re-authenticate
        if (error instanceof TRPCClientError) {
          const data = error.data as TRPCErrorData | undefined
          const code = data?.code
          if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const info = getErrorInfo(error)
      console.error('[Query Error]', query.queryKey, info)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const info = getErrorInfo(error)
      console.error('[Mutation Error]', info)
    },
  }),
})
