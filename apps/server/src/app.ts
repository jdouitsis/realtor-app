import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import type { Database } from './db'
import { env } from './env'
import { withEmailTemplateViewer } from './infra/email/dev-viewer'
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

  app.use(cors({ origin: env.WEB_URL, credentials: true }))
  app.use(cookieParser())
  app.use(express.json())
  app.use(withTrpc({ dbOverride }))

  app.get('/health', (_, res) => res.json({ status: 'ok' }))

  // Dev-only routes
  if (env.isDev) {
    app.use(withEmailTemplateViewer())
  }

  return app
}
