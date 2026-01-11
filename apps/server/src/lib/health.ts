import { createMiddleware } from './middleware'

/**
 * Middleware that registers a health check endpoint at /health.
 * Returns { status: 'ok' } for monitoring and load balancer checks.
 *
 * @example
 * app.use(withHealthCheck())
 */
export const withHealthCheck = () =>
  createMiddleware({
    setup: (app) => {
      app.get('/health', (_, res) => res.json({ status: 'ok' }))
    },
  })
