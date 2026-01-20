import { users } from '@server/db/schema'
import { emailService } from '@server/infra/email'
import { renderEmail } from '@server/infra/email/render'
import { authError } from '@server/lib/errors'
import { createRateLimitMiddleware, publicProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const registerInput = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
  name: z.string().min(1),
})

const registerOutput = z.object({
  message: z.string(),
  email: z.string(),
})

/**
 * Registers a new user and adds them to the waitlist.
 * Sends a confirmation email after registration.
 *
 * @example
 * await trpc.auth.register.mutate({ email: 'user@example.com', name: 'John' })
 */
export const register = publicProcedure
  .use(createRateLimitMiddleware('auth'))
  .input(registerInput)
  .output(registerOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

    if (existing) {
      throw authError('EMAIL_ALREADY_EXISTS', "You're already registered!")
    }

    // Create user with waitlist flag
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        isRealtor: true,
        isWaitlist: true,
      })
      .returning()

    // Send waitlist confirmation email
    const { html, text } = await renderEmail({
      type: 'waitlistConfirmation',
      name: user.name,
    })

    await emailService.send({
      to: user.email,
      subject: "You're on the waitlist!",
      html,
      text,
      dev: {
        type: 'waitlistConfirmation',
        to: user.email,
        name: user.name,
      },
    })

    return {
      message: "You're on the waitlist! Check your email for confirmation.",
      email: input.email,
    }
  })
