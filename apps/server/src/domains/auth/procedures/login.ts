import { eq } from 'drizzle-orm'

import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { publicProcedure } from '@server/trpc'
import { z } from 'zod'

import { createOtpCode, sendOtpEmail } from '../services/otp'

const loginInput = z.object({
  email: z.string().email(),
})

const loginOutput = z.object({
  message: z.string(),
  userId: z.string(),
})

export const login = publicProcedure
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
      userId: user.id,
    }
  })
