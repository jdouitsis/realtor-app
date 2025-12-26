import { eq } from 'drizzle-orm'

import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { publicProcedure } from '@server/trpc'
import { z } from 'zod'

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const loginOutput = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  token: z.string(),
})

export const login = publicProcedure
  .input(loginInput)
  .output(loginOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (!user) {
      throw authError('INVALID_CREDENTIALS', 'Invalid email or password.')
    }

    return {
      user,
      token: 'dummy-token',
    }
  })
