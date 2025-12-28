import type { Session, User } from '../db/schema'
import { type Context, createContext, createContextFactory, router, t } from './init'
import {
  authMiddleware,
  createRateLimitMiddleware,
  freshOtpMiddleware,
  loggingMiddleware,
} from './middlewares'

// Re-export from init and middlewares
export { createContext, createContextFactory, createRateLimitMiddleware, router }
export type { Context }

// Procedures
export const publicProcedure = t.procedure.use(loggingMiddleware)
export const protectedProcedure = publicProcedure.use(authMiddleware)

/** Procedure that requires a fresh OTP verification (within last 15 minutes) */
export const sensitiveProtectedProcedure = protectedProcedure.use(freshOtpMiddleware)

/** Context with authenticated user - available in protectedProcedure */
export type ProtectedContext = Context & { user: User; session: Session }
