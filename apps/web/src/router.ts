import { createRouter } from '@tanstack/react-router'

import type { RouterContext } from './lib/router-context'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be provided by App component
  } as RouterContext,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
