import { z } from 'zod'
import { publicProcedure } from '../../../trpc'

const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

const registerOutput = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional(),
  }),
  token: z.string(),
})

export const register = publicProcedure
  .input(registerInput)
  .output(registerOutput)
  .mutation(async ({ input }) => {
    // TODO: Implement real registration
    return {
      user: { id: '1', email: input.email, name: input.name },
      token: 'dummy-token',
    }
  })
