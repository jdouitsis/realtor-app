import { createRouter } from '@tanstack/react-router'

import { NotFoundPage } from '@/features/errors'
import type { RouterContext } from '@/lib/router-context'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: undefined! as RouterContext,
  defaultNotFoundComponent: NotFoundPage,
})

// Cross-tab sync: when another tab changes auth_token, invalidate router
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_token') {
      void router.invalidate()
    }
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
