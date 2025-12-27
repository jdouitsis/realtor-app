import type { User } from '../db/schema'
import { type Context, createContext, router, t } from './init'
import { authMiddleware, loggingMiddleware } from './middlewares'

// Re-export from init
export { createContext, router }
export type { Context }

// Procedures
export const publicProcedure = t.procedure.use(loggingMiddleware)
export const protectedProcedure = publicProcedure.use(authMiddleware)

/** Context with authenticated user - available in protectedProcedure */
export type ProtectedContext = Context & { user: User }
