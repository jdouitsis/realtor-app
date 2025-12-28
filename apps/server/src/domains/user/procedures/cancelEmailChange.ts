import { users } from '@server/db/schema'
import { protectedProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { invalidateUserOtps } from '../../auth/services/otp'

const cancelEmailChangeOutput = z.object({
  success: z.boolean(),
})

/**
 * Cancels a pending email change request.
 *
 * @example
 * await trpc.user.cancelEmailChange.mutate()
 */
export const cancelEmailChange = protectedProcedure
  .output(cancelEmailChangeOutput)
  .mutation(async ({ ctx: { db, user } }) => {
    // Clear pending email fields
    await db
      .update(users)
      .set({
        pendingEmail: null,
        pendingEmailExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Invalidate any pending OTPs
    await invalidateUserOtps(db, user.id)

    return { success: true }
  })
