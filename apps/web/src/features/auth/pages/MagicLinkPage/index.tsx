import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { match } from 'ts-pattern'

import { parseError } from '@/lib/errors'
import { setStorage } from '@/lib/storage'
import { trpc } from '@/lib/trpc'

import { MagicLinkStatus } from './components/MagicLinkStatus'

const routeApi = getRouteApi('/_public/login/magic')

export function MagicLinkPage() {
  const { token, redirect: redirectUrl } = routeApi.useSearch()
  const navigate = useNavigate()

  const verifyMutation = trpc.auth.verifyMagicLink.useMutation({
    onSuccess: (result) => {
      setStorage('auth_token', result.token)

      // Redirect after brief success state
      setTimeout(() => {
        const destination = result.redirectUrl ?? redirectUrl ?? '/dashboard'
        void navigate({ to: destination })
      }, 2000)
    },
  })

  useEffect(() => {
    verifyMutation.mutate({ token })
    // Only run once on mount
  }, [])

  const status = match(verifyMutation)
    .with({ isPending: true }, () => 'loading' as const)
    .with({ isSuccess: true }, () => 'success' as const)
    .otherwise(() => 'error' as const)

  const errorMessage = verifyMutation.error
    ? parseError(verifyMutation.error).userMessage
    : undefined

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <MagicLinkStatus status={status} errorMessage={errorMessage} />
    </div>
  )
}
