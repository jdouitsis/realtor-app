import { protectedProcedure } from '@server/trpc'
import { z } from 'zod'

import { createOtpCode, invalidateUserOtps, sendOtpEmail } from '../../auth/services/otp'

const requestStepUpOtpOutput = z.object({
  success: z.boolean(),
  message: z.string(),
})

/**
 * Requests a step-up OTP for sensitive actions. Sends OTP to user's current email.
 *
 * @example
 * await trpc.user.requestStepUpOtp.mutate()
 */
export const requestStepUpOtp = protectedProcedure
  .output(requestStepUpOtpOutput)
  .mutation(async ({ ctx: { db, user } }) => {
    // Invalidate any existing OTPs
    await invalidateUserOtps(db, user.id)

    // Create and send new OTP
    const code = await createOtpCode(db, user.id)
    await sendOtpEmail(user.email, code)

    return {
      success: true,
      message: 'Verification code sent to your email',
    }
  })
