import { realtorClients, users } from '@server/db/schema'
import { notFound } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

import { magicLinkService, sendMagicLinkEmail } from '../../auth/services/magicLink'

const resendInviteInput = z.object({
  id: z.string().uuid(),
  redirectUrl: z.string(),
})

const resendInviteOutput = z.object({
  success: z.boolean(),
})

/**
 * Resends an invitation email to a client with 'invited' status.
 * Generates a new magic link and sends it to the client's email.
 *
 * @example
 * await trpc.clients.resendInvite.mutate({
 *   id: 'relationship-id',
 *   redirectUrl: '/forms',
 * })
 */
export const resendInvite = protectedProcedure
  .input(resendInviteInput)
  .output(resendInviteOutput)
  .mutation(async ({ input, ctx: { db, user, req } }) => {
    // Fetch the client relationship with user details
    const [result] = await db
      .select({
        id: realtorClients.id,
        clientId: users.id,
        email: users.email,
        status: realtorClients.status,
      })
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(
        and(
          eq(realtorClients.id, input.id),
          eq(realtorClients.realtorId, user.id),
          isNull(realtorClients.deletedAt)
        )
      )
      .limit(1)

    if (!result) {
      throw notFound('Client', input.id)
    }

    if (result.status !== 'invited') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Can only resend invites to clients with invited status',
      })
    }

    // Generate new magic link and send email
    const { magicUrl } = await magicLinkService.create(db, {
      userId: result.clientId,
      redirectUrl: input.redirectUrl,
      createdBy: user.id,
      ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
    })
    await sendMagicLinkEmail(result.email, magicUrl)

    return { success: true }
  })
