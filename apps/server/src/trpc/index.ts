import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

import { ZodError } from 'zod'

import { db } from '../db'
import { env } from '../env'
import { AppError } from '../lib/errors'

/** Generates a unique request ID for tracing */
function generateRequestId(): string {
  return crypto.randomUUID().replaceAll('-', '_')
}

// Context
export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    db,
    requestId: generateRequestId(),
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
export const publicProcedure = t.procedure
