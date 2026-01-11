import { AppError, AppErrorCode } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { magicLinkService } from '../services/magicLink'
import { sessionService } from '../services/session'

const verifyMagicLinkInput = z.object({
  token: z.string().length(64),
})

const verifyMagicLinkOutput = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  token: z.string(),
  redirectUrl: z.string().nullable(),
})

/**
 * Verify a magic link token and create a session.
 * Consumes the magic link after successful verification.
 */
export const verifyMagicLink = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(verifyMagicLinkInput)
  .output(verifyMagicLinkOutput)
  .mutation(async ({ input, ctx: { db, req } }) => {
    const result = await magicLinkService.validate(db, input.token)

    if (!result.success) {
      const [code, message] = match<typeof result.error, [AppErrorCode, string]>(result.error)
        .with('not_found', () => ['MAGIC_LINK_INVALID', 'Invalid magic link.'] as const)
        .with('expired', () => ['MAGIC_LINK_EXPIRED', 'This magic link has expired.'] as const)
        .with(
          'already_used',
          () => ['MAGIC_LINK_USED', 'This magic link has already been used.'] as const
        )
        .exhaustive()
      throw new AppError({ code, message })
    }

    // Consume the magic link (mark as used)
    await magicLinkService.consume(db, input.token)

    // Create a new 30-day session
    const sessionToken = await sessionService.create(db, result.user.id, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
    })

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      token: sessionToken,
      redirectUrl: result.magicLink.redirectUrl,
    }
  })
