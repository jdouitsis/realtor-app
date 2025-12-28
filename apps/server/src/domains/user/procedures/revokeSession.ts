import { sessions } from '@server/db/schema'
import { AppError } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

import { getSessionToken } from '../../auth/lib/token'

const revokeSessionInput = z.object({
  sessionId: z.string().uuid(),
})

const revokeSessionOutput = z.object({
  success: z.boolean(),
})

/**
 * Revokes a specific session by ID. Cannot revoke the current session.
 *
 * @example
 * await trpc.user.revokeSession.mutate({ sessionId: 'session-uuid' })
 */
export const revokeSession = protectedProcedure
  .input(revokeSessionInput)
  .output(revokeSessionOutput)
  .mutation(async ({ input, ctx: { db, req, user } }) => {
    const currentToken = getSessionToken(req)

    // Find the session to revoke (only active sessions)
    const [sessionToRevoke] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.userId, user.id),
          isNull(sessions.invalidatedAt)
        )
      )
      .limit(1)

    if (!sessionToRevoke) {
      throw new AppError({ code: 'NOT_FOUND', message: 'Session not found' })
    }

    // Prevent revoking current session
    if (sessionToRevoke.token === currentToken) {
      throw new AppError({
        code: 'INVALID_CREDENTIALS',
        message: 'Cannot revoke current session. Use logout instead.',
      })
    }

    // Mark the session as invalidated
    await db
      .update(sessions)
      .set({ invalidatedAt: new Date() })
      .where(eq(sessions.id, input.sessionId))

    return { success: true }
  })
