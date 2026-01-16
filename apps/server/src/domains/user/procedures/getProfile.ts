import { protectedProcedure } from '@server/trpc'
import { z } from 'zod'

const getProfileOutput = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  pendingEmail: z.string().nullable(),
  pendingEmailExpiresAt: z.date().nullable(),
  createdAt: z.date(),
})

/**
 * Returns the current user's profile information.
 *
 * @example
 * const profile = await trpc.user.getProfile.query()
 */
export const getProfile = protectedProcedure.output(getProfileOutput).query(({ ctx: { user } }) => {
  const pendingEmail =
    user.pendingEmailExpiresAt && user.pendingEmailExpiresAt > new Date() ? user.pendingEmail : null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pendingEmail,
    pendingEmailExpiresAt: pendingEmail ? user.pendingEmailExpiresAt : null,
    createdAt: user.createdAt,
  }
})
