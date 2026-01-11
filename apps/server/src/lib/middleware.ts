import type { Application, Handler } from 'express'

interface CreateMiddlewareProps {
  /**
   * Exposes the express app that can be used to setup the middleware.
   *
   * @param app The Express app
   */
  setup: (app: Application) => void
}

/**
 * Creates a middleware function that exposes the Express app for setup.
 * Useful for registering routes or middleware dynamically.
 *
 * @example
 * app.use(createMiddleware({
 *   setup: (app) => {
 *     app.get('/custom', (req, res) => res.send('ok'))
 *   }
 * }))
 */
export const createMiddleware = ({ setup }: CreateMiddlewareProps): Handler => {
  return (req, _res, next) => {
    setup(req.app)
    next()
  }
}
