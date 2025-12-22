import { z } from 'zod'
import { publicProcedure } from '../../../trpc'

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const loginOutput = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  token: z.string(),
})

export const login = publicProcedure
  .input(loginInput)
  .output(loginOutput)
  .mutation(async ({ input }) => {
    return {
      user: { id: '1', email: input.email, name: input.email.split('@')[0] },
      token: 'dummy-token',
    }
  })
