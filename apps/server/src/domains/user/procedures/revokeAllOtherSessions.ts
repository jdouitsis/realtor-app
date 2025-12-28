import { sessions } from '@server/db/schema'
import { protectedProcedure } from '@server/trpc'
import { and, eq, isNull, ne } from 'drizzle-orm'
import { z } from 'zod'

import { getSessionToken } from '../../auth/lib/token'

const revokeAllOtherSessionsOutput = z.object({
  success: z.boolean(),
  revokedCount: z.number(),
})

/**
 * Revokes all sessions except the current one.
 *
 * @example
 * const { revokedCount } = await trpc.user.revokeAllOtherSessions.mutate()
 */
export const revokeAllOtherSessions = protectedProcedure
  .output(revokeAllOtherSessionsOutput)
  .mutation(async ({ ctx: { db, req, user } }) => {
    const currentToken = getSessionToken(req)

    if (!currentToken) {
      return { success: true, revokedCount: 0 }
    }

    // Count active sessions to be revoked
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

    // Mark all other sessions as invalidated
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

    return { success: true, revokedCount: otherSessions.length }
  })
