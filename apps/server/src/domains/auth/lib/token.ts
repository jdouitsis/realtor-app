import type { Request } from 'express'

/**
 * Extracts the session token from the Authorization header.
 *
 * @example
 * const token = getSessionToken(req)
 * if (!token) throw new AppError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
 */
export function getSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}
