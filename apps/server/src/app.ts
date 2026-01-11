import withCookieParser from 'cookie-parser'
import express from 'express'

import type { Database } from './db'
import { env } from './env'
import { withEmailTemplateViewer } from './infra/email/dev-viewer'
import { withCors } from './lib/cors'
import { withHealthCheck } from './lib/health'
import { withTrpc } from './trpc/express'

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

  app.use(express.json())

  app.use(withCors())
  app.use(withCookieParser())
  app.use(withTrpc({ dbOverride }))

  app.use(withHealthCheck())

  // Dev-only routes
  if (env.isDev) {
    app.use(withEmailTemplateViewer())
  }

  return app
}
