import { createRouter } from '@tanstack/react-router'

import type { RouterContext } from '@/lib/router-context'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: undefined! as RouterContext,
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
