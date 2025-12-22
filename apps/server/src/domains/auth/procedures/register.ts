import { z } from 'zod'
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
  .mutation(async ({ input }) => {
    return {
      user: { id: '1', email: input.email, name: input.name ?? input.email.split('@')[0] },
      token: 'dummy-token',
    }
  })
