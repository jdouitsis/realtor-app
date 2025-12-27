import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { z } from 'zod'

import { createOtpCode, getUserEmail, invalidateUserOtps, sendOtpEmail } from '../services/otp'

const resendOtpInput = z.object({
  userId: z.string().uuid(),
})

const resendOtpOutput = z.object({
  message: z.string(),
})

export const resendOtp = publicProcedure
  .use(createRateLimitMiddleware('otpRequest'))
  .input(resendOtpInput)
  .output(resendOtpOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    // Get user email
    const email = await getUserEmail(db, input.userId)
    if (!email) {
      throw authError('USER_NOT_FOUND', 'User not found.')
    }

    // Invalidate existing OTPs
    await invalidateUserOtps(db, input.userId)

    // Create and send new OTP
    const code = await createOtpCode(db, input.userId)
    await sendOtpEmail(email, code)

    return {
      message: 'A new code has been sent to your email.',
    }
  })
