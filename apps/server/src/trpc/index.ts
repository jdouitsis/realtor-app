import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { ZodError } from 'zod'

import { db } from '../db'
import { env } from '../env'
import { AppError } from '../lib/errors'
import { createRequestLogger } from '../lib/logger'

/** Generates a unique request ID for tracing */
function generateRequestId(): string {
  return crypto.randomUUID().replaceAll('-', '_')
}

// Context
export function createContext({ req, res }: CreateExpressContextOptions) {
  const requestId = generateRequestId()
  const log = createRequestLogger({ requestId })

  return {
    req,
    res,
    db,
    requestId,
    log,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

// tRPC initialization with error formatting
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error, ctx }) {
    const zodError = error.cause instanceof ZodError ? error.cause.flatten() : null
    // Extract app-specific error code if this is an AppError
    const appCode = error instanceof AppError ? error.appCode : null

    return {
      ...shape,
      data: {
        ...shape.data,
        requestId: ctx?.requestId ?? 'unknown',
        appCode,
        zodError: error.code === 'BAD_REQUEST' ? zodError : null,
        // Only include stack traces in development
        stack: env.isDev ? error.stack : undefined,
      },
    }
  },
})

export const router = t.router

// Logging middleware - enriches logger with path, type, and input
const loggingMiddleware = t.middleware(async ({ ctx, path, type, input, next }) => {
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

export const publicProcedure = t.procedure.use(loggingMiddleware)
