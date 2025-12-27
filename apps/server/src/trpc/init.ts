import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { ZodError } from 'zod'

import { type Database, db } from '../db'
import { env } from '../env'
import { AppError } from '../lib/errors'
import { createRequestLogger } from '../lib/logger'

/** Generates a unique request ID for tracing */
function generateRequestId(): string {
  return crypto.randomUUID().replaceAll('-', '_')
}

/**
 * Factory function for creating tRPC context with injectable database.
 * Enables testing with transaction-wrapped db instances.
 *
 * @example
 * // Production (uses default db)
 * const createContext = createContextFactory()
 *
 * // Testing (uses transaction-wrapped db)
 * const createContext = createContextFactory(testTx)
 */
export function createContextFactory(dbOverride?: Database) {
  return function createContext({ req, res }: CreateExpressContextOptions) {
    const requestId = generateRequestId()
    const log = createRequestLogger({ requestId })

    return {
      req,
      res,
      db: dbOverride ?? db,
      requestId,
      log,
    }
  }
}

// Default context factory for production use
export const createContext = createContextFactory()

export type Context = Awaited<ReturnType<typeof createContext>>

// tRPC initialization with error formatting
export const t = initTRPC.context<Context>().create({
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
