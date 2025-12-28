import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { TRPCClientError } from '@trpc/client'

import { clearStorage } from '@/lib/storage'

import { router } from '../router'
import { parseError } from './errors'

/** Shape of tRPC error data for retry logic */
interface TRPCErrorData {
  code?: string
  appCode?: string
}

/** Extracts error info for logging */
function getErrorInfo(error: unknown) {
  const parsed = parseError(error)
  return {
    message: parsed.debugMessage,
    code: parsed.code,
    appCode: parsed.appCode,
    requestId: parsed.requestId,
  }
}

/** Handles REQUEST_NEW_OTP errors by redirecting to step-up verification */
function handleStepUpRedirect(error: unknown): boolean {
  const parsed = parseError(error)
  if (parsed.appCode === 'REQUEST_NEW_OTP') {
    const currentPath = router.state.location.pathname
    void router.navigate({ to: '/otp', search: { redirect: currentPath } })
    return true
  }
  return false
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
          if (code === 'UNAUTHORIZED') {
            clearStorage('auth_token')
            void router.navigate({ to: '/login' })
            return false
          }
          if (code === 'FORBIDDEN') {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Handle step-up OTP redirect globally
      if (handleStepUpRedirect(error)) {
        console.log('Step-up OTP redirect')
        return
      }
      const parsed = parseError(error)
      if (parsed.code === 'UNAUTHORIZED') {
        clearStorage('auth_token')
        void router.navigate({ to: '/login' })
        return false
      }
      const info = getErrorInfo(error)
      console.error('[Query Error]', query.queryKey, info)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Handle step-up OTP redirect globally
      if (handleStepUpRedirect(error)) {
        console.log('Step-up OTP redirect')
        return
      }

      const info = getErrorInfo(error)
      console.error('[Mutation Error]', info)
    },
  }),
})
