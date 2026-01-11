import { users } from '@server/db/schema'
import { env } from '@server/env'
import { notFound } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { magicLinkService } from '../services/magicLink'

const DEFAULT_EXPIRY_HOURS = 24

const generateMagicLinkInput = z.object({
  userId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
  redirectUrl: z.string().optional(),
})

const generateMagicLinkOutput = z.object({
  url: z.string().url(),
  expiresAt: z.string().datetime(),
})

/**
 * Generate a magic link URL for a specific user.
 * Protected procedure - requires authenticated user (admin use case).
 */
export const generateMagicLink = protectedProcedure
  .input(generateMagicLinkInput)
  .output(generateMagicLinkOutput)
  .mutation(async ({ input, ctx: { db, user: adminUser } }) => {
    // Verify target user exists
    const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1)

    if (!targetUser) {
      throw notFound('User', input.userId)
    }

    const expiresAt = input.expiresAt
      ? new Date(input.expiresAt)
      : new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000)

    const token = await magicLinkService.create(db, {
      userId: input.userId,
      expiresAt,
      createdBy: adminUser.id,
      redirectUrl: input.redirectUrl,
    })

    const redirectParam = input.redirectUrl
      ? `&redirect=${encodeURIComponent(input.redirectUrl)}`
      : ''
    const url = `${env.WEB_URL}/login/magic?token=${token}${redirectParam}`

    return {
      url,
      expiresAt: expiresAt.toISOString(),
    }
  })
