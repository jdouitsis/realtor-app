import { publicProcedure } from '@server/trpc'
import { z } from 'zod'

import { getSessionToken } from '../lib/cookies'
import { sessionService } from '../services/session'

export const userOutput = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
})

export const me = publicProcedure
  .output(userOutput.nullable())
  .query(async ({ ctx: { req, db } }) => {
    const token = getSessionToken(req)
    if (!token) {
      return null
    }

    const user = await sessionService.validate(db, token)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  })
