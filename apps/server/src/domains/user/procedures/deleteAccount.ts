import { users } from '@server/db/schema'
import { AppError } from '@server/lib/errors'
import { sensitiveProtectedProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { clearSessionCookie } from '../../auth/lib/cookies'

const deleteAccountInput = z.object({
  confirmEmail: z.string().email('Invalid email address'),
})

const deleteAccountOutput = z.object({
  success: z.boolean(),
})

/**
 * Permanently deletes the user's account. Requires fresh OTP verification and email confirmation.
 *
 * @example
 * await trpc.user.deleteAccount.mutate({ confirmEmail: 'user@example.com' })
 */
export const deleteAccount = sensitiveProtectedProcedure
  .input(deleteAccountInput)
  .output(deleteAccountOutput)
  .mutation(async ({ input, ctx: { db, res, user } }) => {
    // Verify email matches
    if (input.confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new AppError({
        code: 'INVALID_CREDENTIALS',
        message: 'Email address does not match your account',
      })
    }

    // Delete the user (sessions and OTPs will cascade delete)
    await db.delete(users).where(eq(users.id, user.id))

    // Clear the session cookie
    clearSessionCookie(res)

    return { success: true }
  })
