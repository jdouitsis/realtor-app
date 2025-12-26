import { users } from '@server/db/schema'
import { authError } from '@server/lib/errors'
import { publicProcedure } from '@server/trpc'
import { z } from 'zod'

const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
})

const registerOutput = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  token: z.string(),
})

export const register = publicProcedure
  .input(registerInput)
  .output(registerOutput)
  .mutation(async ({ input, ctx: { db } }) => {
    const [user] = await db
      .insert(users)
      .values({
        email: input.email,
        name: input.name ?? input.email.split('@')[0],
        passwordHash: '',
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .catch(() => {
        throw authError(
          'EMAIL_ALREADY_EXISTS',
          `An account with email ${input.email} already exists.`
        )
      })

    return {
      user,
      token: 'dummy-token',
    }
  })
