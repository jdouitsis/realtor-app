import cors from 'cors'

import { env } from '../env'
import { createMiddleware } from './middleware'

/**
 * Middleware that configures CORS for the application.
 * Allows requests from WEB_URL with credentials.
 *
 * @example
 * app.use(withCors())
 */
export const withCors = () =>
  createMiddleware({
    setup: (app) => {
      app.use(cors({ origin: env.WEB_URL, credentials: true }))
    },
  })
