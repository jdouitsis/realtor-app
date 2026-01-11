import { users } from '@server/db/schema'
import { emailService } from '@server/infra/email'
import { AppError } from '@server/lib/errors'
import { sensitiveProtectedProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import ms from 'ms'
import { z } from 'zod'

import { createOtpCode, invalidateUserOtps, sendOtpEmail } from '../../auth/services/otp'

const PENDING_EMAIL_EXPIRY_MS = ms('30 minutes')

const initiateEmailChangeInput = z.object({
  newEmail: z.string().email('Invalid email address'),
})

const initiateEmailChangeOutput = z.object({
  success: z.boolean(),
  message: z.string(),
})

/**
 * Initiates an email change. Requires fresh OTP verification (step-up auth).
 * Sends an OTP to the new email address for verification.
 *
 * @example
 * await trpc.user.initiateEmailChange.mutate({ newEmail: 'new@example.com' })
 */
export const initiateEmailChange = sensitiveProtectedProcedure
  .input(initiateEmailChangeInput)
  .output(initiateEmailChangeOutput)
  .mutation(async ({ input, ctx: { db, user } }) => {
    const { newEmail } = input

    // Check if new email is the same as current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new AppError({
        code: 'ALREADY_EXISTS',
        message: 'New email cannot be the same as your current email',
      })
    }

    // Check if new email is already registered
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, newEmail.toLowerCase()))
      .limit(1)

    if (existingUser) {
      throw new AppError({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'This email is already associated with another account',
      })
    }

    // Invalidate any existing OTPs
    await invalidateUserOtps(db, user.id)

    // Store pending email
    const expiresAt = new Date(Date.now() + PENDING_EMAIL_EXPIRY_MS)
    await db
      .update(users)
      .set({
        pendingEmail: newEmail.toLowerCase(),
        pendingEmailExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Send OTP to new email for verification
    const code = await createOtpCode(db, user.id)
    await sendOtpEmail(newEmail, code)

    // Send notification to current email about the pending change
    await emailService.send({
      to: user.email,
      subject: 'Email change requested',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Email change requested</h1>
          <p style="font-size: 16px; color: #666; margin-bottom: 16px;">
            A request was made to change your email address to <strong>${newEmail}</strong>.
          </p>
          <p style="font-size: 16px; color: #666; margin-bottom: 24px;">
            A verification code has been sent to the new email address.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 24px;">
            If you didn't request this change, please secure your account immediately.
          </p>
        </div>
      `,
      text: `Email change requested\n\nA request was made to change your email address to ${newEmail}.\n\nA verification code has been sent to the new email address.\n\nIf you didn't request this change, please secure your account immediately.`,
      dev: {
        type: 'email_change_notification',
        to: user.email,
        newEmail,
      },
    })

    return {
      success: true,
      message: 'Verification code sent to your new email address',
    }
  })
