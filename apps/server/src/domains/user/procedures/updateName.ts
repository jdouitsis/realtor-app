import { users } from '@server/db/schema'
import { protectedProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateNameInput = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
})

const updateNameOutput = z.object({
  success: z.boolean(),
  name: z.string(),
})

/**
 * Updates the current user's display name.
 *
 * @example
 * await trpc.user.updateName.mutate({ name: 'John Doe' })
 */
export const updateName = protectedProcedure
  .input(updateNameInput)
  .output(updateNameOutput)
  .mutation(async ({ input, ctx: { db, user } }) => {
    await db
      .update(users)
      .set({ name: input.name, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    return { success: true, name: input.name }
  })
