import { protectedProcedure } from '@server/trpc'
import { z } from 'zod'

import { clientInviteService } from '../services/invite'

const inviteInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  redirectUrl: z.string(),
})

const inviteOutput = z.object({
  clientId: z.string(),
})

/**
 * Invites a client by email. Creates the user if they don't exist,
 * establishes the realtor-client relationship, and sends a magic link.
 *
 * @example
 * const { clientId } = await trpc.clients.invite.mutate({
 *   email: 'client@example.com',
 *   name: 'John Doe',
 *   redirectUrl: '/forms',
 * })
 */
export const invite = protectedProcedure
  .input(inviteInput)
  .output(inviteOutput)
  .mutation(async ({ input, ctx: { db, user, req } }) => {
    return clientInviteService.invite(db, {
      realtorId: user.id,
      email: input.email,
      name: input.name,
      redirectUrl: input.redirectUrl,
      ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
    })
  })
