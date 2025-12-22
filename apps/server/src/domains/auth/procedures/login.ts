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
    name: z.string().optional(),
  }),
  token: z.string(),
})

export const login = publicProcedure
  .input(loginInput)
  .output(loginOutput)
  .mutation(async ({ input }) => {
    // TODO: Implement real auth
    return {
      user: { id: '1', email: input.email },
      token: 'dummy-token',
    }
  })
