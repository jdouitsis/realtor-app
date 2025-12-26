import { publicProcedure } from '@server/trpc'
import { z } from 'zod'

import { clearSessionCookie, getSessionToken } from '../lib/cookies'
import { sessionService } from '../services/session'

const logoutOutput = z.object({
  success: z.boolean(),
})

export const logout = publicProcedure
  .output(logoutOutput)
  .mutation(async ({ ctx: { req, res, db } }) => {
    const token = getSessionToken(req)
    if (token) {
      await sessionService.invalidate(db, token)
    }

    clearSessionCookie(res)

    return { success: true }
  })
