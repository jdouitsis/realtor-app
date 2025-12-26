import { z } from 'zod'

import { publicProcedure } from '../../../trpc'

export const userOutput = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
})

export const me = publicProcedure.output(userOutput.nullable()).query(async () => {
  // TODO: Get user from session/token
  return null
})
