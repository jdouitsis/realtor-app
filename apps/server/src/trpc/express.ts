import { createExpressMiddleware } from '@trpc/server/adapters/express'

import type { Database } from '../db'
import { env } from '../env'
import { logger } from '../lib/logger'
import { createMiddleware } from '../lib/middleware'
import { appRouter } from '../routers'
import { createContextFactory } from './init'

interface WithTrpcOptions {
  /** Database override for testing with transaction-wrapped db instances */
  dbOverride?: Database
}

/**
 * Express middleware that registers the tRPC router at /trpc.
 * Supports database injection for testing.
 *
 * @example
 * // Production
 * app.use(withTrpc())
 *
 * // Testing with transaction-wrapped db
 * app.use(withTrpc({ dbOverride: testTx }))
 */
export const withTrpc = (options: WithTrpcOptions = {}) =>
  createMiddleware({
    setup: (app) => {
      app.use(
        '/trpc',
        createExpressMiddleware({
          router: appRouter,
          createContext: createContextFactory(options.dbOverride),
          onError({ error, ctx, path, type }) {
            // Use context logger if available, fall back to root logger
            const log = ctx?.log ?? logger
            log.error(
              {
                path,
                type,
                code: error.code,
                stack: env.isDev ? error.stack : undefined,
              },
              error.message
            )
          },
        })
      )
    },
  })
