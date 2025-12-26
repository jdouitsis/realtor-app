import { z } from 'zod'

import { users } from '../../../db/schema'
import { publicProcedure } from '../../../trpc'

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

    return {
      user,
      token: 'dummy-token',
    }
  })
