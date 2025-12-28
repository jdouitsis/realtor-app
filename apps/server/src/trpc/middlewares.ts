import { getSessionToken } from '@server/domains/auth/lib/token'
import { sessionService } from '@server/domains/auth/services/session'
import { AppError } from '@server/lib/errors'
import { getRateLimitConfig, type RateLimitType } from '@server/lib/rate-limit'
import { TRPCError } from '@trpc/server'
import { RateLimiterMemory } from 'rate-limiter-flexible'

import { t } from './init'

/**
 * Creates a rate limiting middleware for the specified limit type.
 * Uses client IP as the key. Returns TOO_MANY_REQUESTS on limit exceeded.
 *
 * Uses in-memory store (suitable for single-instance deployments).
 * For multi-instance deployments, swap RateLimiterMemory to RateLimiterRedis.
 *
 * Available rate limit types:
 * - `'auth'` - 5 requests per minute (login, register)
 * - `'otpVerify'` - 5 attempts per 15 minutes
 * - `'otpRequest'` - 3 requests per 5 minutes (resend OTP)
 *
 * @example
 * export const login = publicProcedure
 *   .use(createRateLimitMiddleware('auth'))
 *   .input(loginInput)
 *   .mutation(...)
 *
 * @example
 * export const verifyOtp = publicProcedure
 *   .use(createRateLimitMiddleware('otpVerify'))
 *   .input(verifyOtpInput)
 *   .mutation(...)
 */
export function createRateLimitMiddleware(type: RateLimitType) {
  const config = getRateLimitConfig(type)
  const limiter = new RateLimiterMemory({
    keyPrefix: config.prefix,
    points: config.points,
    duration: config.duration,
  })

  return t.middleware(async ({ ctx, next }) => {
    const ip = ctx.req.ip ?? ctx.req.socket.remoteAddress ?? 'unknown'

    try {
      await limiter.consume(ip)
    } catch {
      ctx.log.warn({ ip, type }, 'Rate limit exceeded')
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.',
      })
    }

    return next({ ctx })
  })
}

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

/** Validates session and injects user + session into context */
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = getSessionToken(ctx.req)
  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }

  const result = await sessionService.validate(ctx.db, token)
  if (!result) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired session',
    })
  }

  return next({ ctx: { ...ctx, user: result.user, session: result.session } })
})

const FRESH_OTP_DURATION_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Requires a fresh OTP verification (within last 15 minutes) for sensitive actions.
 * Must be used after authMiddleware.
 * Throws REQUEST_NEW_OTP error if OTP verification is stale or missing.
 */
export const freshOtpMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = (ctx as { session?: { lastOtpVerifiedAt: Date | null } }).session

  if (!session) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'freshOtpMiddleware must be used after authMiddleware',
    })
  }

  const lastVerified = session.lastOtpVerifiedAt
  const now = Date.now()

  if (!lastVerified || now - lastVerified.getTime() > FRESH_OTP_DURATION_MS) {
    throw new AppError({
      code: 'REQUEST_NEW_OTP',
      message: 'Please verify your identity to continue.',
    })
  }

  return next({ ctx })
})
