import { users } from '@server/db/schema'
import { AppError, AppErrorCode } from '@server/lib/errors'
import { publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { setSessionCookie } from '../lib/cookies'
import { verifyOtpCode } from '../services/otp'
import { sessionService } from '../services/session'

const verifyOtpInput = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
})

const verifyOtpOutput = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
})

export const verifyOtp = publicProcedure
  .input(verifyOtpInput)
  .output(verifyOtpOutput)
  .mutation(async ({ input, ctx: { db, res } }) => {
    const result = await verifyOtpCode(db, input.userId, input.code)

    if (!result.success) {
      const [code, message] = match<typeof result.error, [AppErrorCode, string]>(result.error)
        .with('expired', () => ['OTP_EXPIRED', 'This code has expired.'])
        .with('invalid', () => ['OTP_INVALID', 'Invalid code.'])
        .with('max_attempts', () => ['OTP_MAX_ATTEMPTS', 'Too many attempts.'])
        .exhaustive()
      throw new AppError({ code, message })
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, result.userId)).limit(1)

    if (!user) {
      throw new AppError({ code: 'USER_NOT_FOUND', message: 'User not found.' })
    }

    // Create session and set cookie
    const sessionToken = await sessionService.create(db, user.id)
    setSessionCookie(res, sessionToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  })
