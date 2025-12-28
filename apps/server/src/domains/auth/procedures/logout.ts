import { protectedProcedure } from '@server/trpc'
import { z } from 'zod'

import { getSessionToken } from '../lib/token'
import { sessionService } from '../services/session'

const logoutOutput = z.object({
  success: z.boolean(),
})

export const logout = protectedProcedure
  .output(logoutOutput)
  .mutation(async ({ ctx: { req, db } }) => {
    const token = getSessionToken(req)
    if (token) {
      await sessionService.invalidate(db, token)
    }

    return { success: true }
  })
