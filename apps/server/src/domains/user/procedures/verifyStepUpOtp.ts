import { AppError } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { verifyOtpCode } from '../../auth/services/otp'
import { sessionService } from '../../auth/services/session'

const verifyStepUpOtpInput = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

const verifyStepUpOtpOutput = z.object({
  success: z.boolean(),
})

/**
 * Verifies the step-up OTP and marks the session as recently verified.
 * After successful verification, sensitive actions will be allowed for 15 minutes.
 *
 * @example
 * await trpc.user.verifyStepUpOtp.mutate({ code: '123456' })
 */
export const verifyStepUpOtp = protectedProcedure
  .input(verifyStepUpOtpInput)
  .output(verifyStepUpOtpOutput)
  .mutation(async ({ input, ctx: { db, user, session } }) => {
    const result = await verifyOtpCode(db, user.id, input.code)

    if (!result.success) {
      const error = match(result.error)
        .with('max_attempts', () => ({ code: 'OTP_MAX_ATTEMPTS', message: 'Too many attempts. Please request a new code.' } as const))
        .with('expired', () => ({ code: 'OTP_EXPIRED', message: 'Verification code has expired' } as const))
        .with('invalid', () => ({ code: 'OTP_INVALID', message: 'Invalid verification code' } as const))
        .exhaustive()

      throw new AppError(error)

    }

    // Update session to mark OTP as recently verified
    await sessionService.updateOtpVerified(db, session.id)

    return { success: true }
  })
