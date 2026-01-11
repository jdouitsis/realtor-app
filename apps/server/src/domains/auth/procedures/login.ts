import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { magicLinkService, sendMagicLinkEmail } from '../services/magicLink'
import { createOtpCode, sendOtpEmail } from '../services/otp'

const loginInput = z.object({
  email: z.string().email(),
  type: z.enum(['otp', 'magic']).default('otp'),
  redirectUrl: z.string().optional(),
})

const loginOutput = z.object({
  message: z.string(),
  email: z.string(),
})

export const login = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(loginInput)
  .output(loginOutput)
  .mutation(async ({ input, ctx: { db, req } }) => {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (!user) {
      throw authError('USER_NOT_FOUND', 'No account found with this email.')
    }

    const { message } = await match(input.type)
      .with('magic', async () => {
        const { magicUrl } = await magicLinkService.create(db, {
          userId: user.id,
          redirectUrl: input.redirectUrl,
          ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
        })
        await sendMagicLinkEmail(user.email, magicUrl)
        return {
          message: 'Check your email for a sign-in link.',
        }
      })
      .with('otp', async () => {
        const code = await createOtpCode(db, user.id)
        await sendOtpEmail(input.email, code)
        return {
          message: 'Check your email for a verification code.',
        }
      })
      .exhaustive()

    return { message, email: input.email }
  })
