import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

import { db } from '../db'

// Context
export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    db,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

// tRPC initialization
const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
