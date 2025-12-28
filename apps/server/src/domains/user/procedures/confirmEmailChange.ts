import { sessions, users } from '@server/db/schema'
import { AppError } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { and, eq, isNull, ne } from 'drizzle-orm'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { getSessionToken } from '../../auth/lib/token'
import { verifyOtpCode } from '../../auth/services/otp'

const confirmEmailChangeInput = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
  invalidateOtherSessions: z.boolean().optional().default(false),
})

const confirmEmailChangeOutput = z.object({
  success: z.boolean(),
  email: z.string(),
  revokedSessionCount: z.number().optional(),
})

/**
 * Confirms the email change by verifying the OTP sent to the new email.
 *
 * @example
 * await trpc.user.confirmEmailChange.mutate({ code: '123456', invalidateOtherSessions: true })
 */
export const confirmEmailChange = protectedProcedure
  .input(confirmEmailChangeInput)
  .output(confirmEmailChangeOutput)
  .mutation(async ({ input, ctx: { db, req, user } }) => {
    // Check if there's a pending email change
    if (!user.pendingEmail || !user.pendingEmailExpiresAt) {
      throw new AppError({
        code: 'INVALID_CREDENTIALS',
        message: 'No pending email change found',
      })
    }

    // Check if pending email has expired
    if (user.pendingEmailExpiresAt < new Date()) {
      // Clear the expired pending email
      await db
        .update(users)
        .set({
          pendingEmail: null,
          pendingEmailExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      throw new AppError({
        code: 'OTP_EXPIRED',
        message: 'Email change request has expired. Please start again.',
      })
    }

    // Verify the OTP for new email
    const result = await verifyOtpCode(db, user.id, input.code)

    if (!result.success) {
      const error = match(result.error)
        .with(
          'expired',
          () => ({ code: 'OTP_EXPIRED', message: 'Verification code has expired' }) as const
        )
        .with(
          'max_attempts',
          () =>
            ({
              code: 'OTP_MAX_ATTEMPTS',
              message: 'Too many attempts. Please request a new code.',
            }) as const
        )
        .with(
          'invalid',
          () => ({ code: 'OTP_INVALID', message: 'Invalid verification code' }) as const
        )
        .exhaustive()

      throw new AppError(error)
    }

    const newEmail = user.pendingEmail

    // Update the email and clear pending fields
    await db
      .update(users)
      .set({
        email: newEmail,
        pendingEmail: null,
        pendingEmailExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Optionally revoke other sessions
    let revokedSessionCount: number | undefined
    if (input.invalidateOtherSessions) {
      const currentToken = getSessionToken(req)

      if (currentToken) {
        const otherSessions = await db
          .select({ id: sessions.id })
          .from(sessions)
          .where(
            and(
              eq(sessions.userId, user.id),
              ne(sessions.token, currentToken),
              isNull(sessions.invalidatedAt)
            )
          )

        revokedSessionCount = otherSessions.length

        await db
          .update(sessions)
          .set({ invalidatedAt: new Date() })
          .where(
            and(
              eq(sessions.userId, user.id),
              ne(sessions.token, currentToken),
              isNull(sessions.invalidatedAt)
            )
          )
      }
    }

    return {
      success: true,
      email: newEmail,
      revokedSessionCount,
    }
  })
