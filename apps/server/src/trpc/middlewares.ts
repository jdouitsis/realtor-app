import { getSessionToken } from '@server/domains/auth/lib/cookies'
import { sessionService } from '@server/domains/auth/services/session'
import { TRPCError } from '@trpc/server'

import { t } from './init'

/** Enriches logger with path, type, and input for request tracing */
export const loggingMiddleware = t.middleware(async ({ ctx, path, type, input, next }) => {
  const startTime = performance.now()

  // Enrich logger with request details (redaction handles sensitive fields in prod)
  const log = ctx.log.child({
    path,
    type,
    input,
  })

  try {
    const result = await next({ ctx: { ...ctx, log } })
    return result
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    log.error({ duration, success: false }, 'Request failed')
    throw error
  }
})

/** Validates session and injects user into context */
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = getSessionToken(ctx.req)
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }

  const user = await sessionService.validate(ctx.db, token)
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired session',
    })
  }

  return next({ ctx: { ...ctx, user } })
})
