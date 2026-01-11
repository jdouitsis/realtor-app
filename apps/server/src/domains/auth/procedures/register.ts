import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { match } from 'ts-pattern'
import { z } from 'zod'

import { magicLinkService, sendMagicLinkEmail } from '../services/magicLink'
import { createOtpCode, sendOtpEmail } from '../services/otp'

const registerInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  type: z.enum(['otp', 'magic']).default('otp'),
  redirectUrl: z.string().optional(),
})

const registerOutput = z.object({
  message: z.string(),
  email: z.string(),
})

export const register = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(registerInput)
  .output(registerOutput)
  .mutation(async ({ input, ctx: { db, req } }) => {
    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (existing) {
      throw authError('EMAIL_ALREADY_EXISTS', 'An account with this email already exists.')
    }

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
      })
      .returning()

    const message = await match(input.type)
      .with('magic', async () => {
        const { magicUrl } = await magicLinkService.create(db, {
          userId: user.id,
          redirectUrl: input.redirectUrl,
          ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString().split(',')[0],
        })
        await sendMagicLinkEmail(user.email, magicUrl)
        return 'Account created! Check your email for a sign-in link.'
      })
      .with('otp', async () => {
        const code = await createOtpCode(db, user.id)
        await sendOtpEmail(input.email, code)
        return 'Account created! Check your email for a verification code.'
      })
      .exhaustive()

    return { message, email: input.email }
  })
