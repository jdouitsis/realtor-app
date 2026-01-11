import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { createOtpCode, sendOtpEmail } from '../services/otp'

const loginInput = z.object({
  email: z.string().email(),
})

const loginOutput = z.object({
  message: z.string(),
  email: z.string(),
})

export const login = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(loginInput)
  .output(loginOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (!user) {
      throw authError('USER_NOT_FOUND', 'No account found with this email.')
    }

    const code = await createOtpCode(db, user.id)
    await sendOtpEmail(input.email, code)

    return {
      message: 'Check your email for a verification code.',
      email: input.email,
    }
  })
