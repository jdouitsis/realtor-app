import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { createOtpCode, sendOtpEmail } from '../services/otp'

const registerInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

const registerOutput = z.object({
  message: z.string(),
  userId: z.string(),
})

export const register = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(registerInput)
  .output(registerOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (existing) {
      throw authError('EMAIL_ALREADY_EXISTS', 'An account with this email already exists.')
    }

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
      })
      .returning()

    // Send OTP
    const code = await createOtpCode(db, user.id)
    await sendOtpEmail(input.email, code)

    return {
      message: 'Account created! Check your email for a verification code.',
      userId: user.id,
    }
  })
