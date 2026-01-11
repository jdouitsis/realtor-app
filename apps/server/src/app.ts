import { createExpressMiddleware } from '@trpc/server/adapters/express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import type { Database } from './db'
import { env } from './env'
import { withEmailTemplateViewer } from './infra/email/dev-viewer'
import { logger } from './lib/logger'
import { appRouter } from './routers'
import { createContextFactory } from './trpc'

/**
 * Creates and configures the Express application.
 * Separated from server startup for testability.
 *
 * @example
 * // Production
 * const app = createApp()
 * app.listen(3001)
 *
 * // Testing with transaction-wrapped db
 * const app = createApp(testTx)
 */
export function createApp(dbOverride?: Database) {
  const app = express()

  app.use(cors({ origin: env.WEB_URL, credentials: true }))
  app.use(cookieParser())
  app.use(express.json())

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: createContextFactory(dbOverride),
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

  app.get('/health', (_, res) => res.json({ status: 'ok' }))

  // Dev-only routes
  if (env.isDev) {
    app.use(withEmailTemplateViewer())
  }

  return app
}
