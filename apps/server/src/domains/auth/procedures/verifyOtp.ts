import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
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
      const errorMap = {
        expired: { code: 'OTP_EXPIRED', message: 'This code has expired.' },
        invalid: { code: 'OTP_INVALID', message: 'Invalid code.' },
        max_attempts: { code: 'OTP_MAX_ATTEMPTS', message: 'Too many attempts.' },
      } as const

      const { code, message } = errorMap[result.error]
      throw authError(code, message)
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, result.userId)).limit(1)

    if (!user) {
      throw authError('OTP_INVALID', 'User not found.')
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
