import { users } from '@server/db/schema'
import { env } from '@server/env'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import ms from 'ms'
import { z } from 'zod'

import { magicLinkService, sendMagicLinkEmail } from '../services/magicLink'

const MAX_EXPIRY_HOURS = 168 // 7 days
const ONE_HOUR_MS = ms('1 hour')

const requestMagicLinkInput = z.object({
  email: z.string().email(),
  expiresInHours: z.number().min(1).max(MAX_EXPIRY_HOURS).optional(),
  redirectUrl: z.string().optional(),
})

const requestMagicLinkOutput = z.object({
  message: z.string(),
})

/**
 * Request a magic link to be sent to the user's email.
 * Always returns the same message to prevent email enumeration.
 */
export const requestMagicLink = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(requestMagicLinkInput)
  .output(requestMagicLinkOutput)
  .mutation(async ({ input, ctx: { db, req } }) => {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    // Always return success message to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists, a magic link has been sent.' }
    }

    const expiresAt = input.expiresInHours
      ? new Date(Date.now() + input.expiresInHours * ONE_HOUR_MS)
      : undefined

    const token = await magicLinkService.create(db, {
      userId: user.id,
      expiresAt,
      redirectUrl: input.redirectUrl,
      ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
    })

    const redirectParam = input.redirectUrl
      ? `&redirect=${encodeURIComponent(input.redirectUrl)}`
      : ''
    const magicUrl = `${env.WEB_URL}/login/magic?token=${token}${redirectParam}`

    await sendMagicLinkEmail(user.email, magicUrl, expiresAt)

    return { message: 'If an account exists, a magic link has been sent.' }
  })
