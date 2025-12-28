import { publicProcedure } from '@server/trpc'
import { z } from 'zod'

import { getSessionToken } from '../lib/token'
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

    const result = await sessionService.validate(db, token)
    if (!result) {
      return null
    }

    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
    }
  })
