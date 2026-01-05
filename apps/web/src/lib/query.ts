/**
 * TanStack Query client with global error handling.
 *
 * Key behaviors:
 * - UNAUTHORIZED errors: Clears auth token and calls router.invalidate()
 *   which triggers route guards to re-evaluate and redirect to /login
 * - REQUEST_NEW_OTP errors: Redirects to /otp for step-up verification
 * - All errors: Logged with request ID for debugging
 *
 * @see ../router.ts for cross-tab sync (storage event listener)
 * @see ../../docs/ADR/2025-12-28-router-based-auth.md for architecture details
 */
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
    const { pathname, searchStr } = router.state.location
    const currentUrl = searchStr ? `${pathname}${searchStr}` : pathname
    void router.navigate({ to: '/otp', search: { redirect: currentUrl } })
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
        // Don't retry on auth errors - invalidate router to trigger route guard redirect
        if (error instanceof TRPCClientError) {
          const data = error.data as TRPCErrorData | undefined
          const code = data?.code
          if (code === 'UNAUTHORIZED') {
            clearStorage('auth_token')
            void router.invalidate() // Route guards check isAuthenticated and redirect to /login
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
        void router.invalidate() // Route guards check isAuthenticated and redirect to /login
        return
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
