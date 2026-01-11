import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { z } from 'zod'

import { createOtpCode, getUserIdByEmail, invalidateUserOtps, sendOtpEmail } from '../services/otp'

const resendOtpInput = z.object({
  email: z.string().email(),
})

const resendOtpOutput = z.object({
  message: z.string(),
})

export const resendOtp = publicProcedure
  .use(createRateLimitMiddleware('otpRequest'))
  .input(resendOtpInput)
  .output(resendOtpOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    const userId = await getUserIdByEmail(db, input.email)
    if (!userId) {
      throw authError('USER_NOT_FOUND', 'User not found.')
    }

    // Invalidate existing OTPs
    await invalidateUserOtps(db, userId)

    // Create and send new OTP
    const code = await createOtpCode(db, userId)
    await sendOtpEmail(input.email, code)

    return {
      message: 'A new code has been sent to your email.',
    }
  })
