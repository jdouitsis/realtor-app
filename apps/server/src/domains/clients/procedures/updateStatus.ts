import { realtorClients } from '@server/db/schema'
import { notFound } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

const updateStatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(['active', 'inactive']),
})

const updateStatusOutput = z.object({
  success: z.boolean(),
})

/**
 * Updates a client's status. Only allows changing between 'active' and 'inactive'.
 * The 'invited' status is managed automatically via magic link consumption.
 *
 * @example
 * await trpc.clients.updateStatus.mutate({ id: 'abc-123', status: 'inactive' })
 */
export const updateStatus = protectedProcedure
  .input(updateStatusInput)
  .output(updateStatusOutput)
  .mutation(async ({ input, ctx: { db, user } }) => {
    const result = await db
      .update(realtorClients)
      .set({ status: input.status })
      .where(
        and(
          eq(realtorClients.id, input.id),
          eq(realtorClients.realtorId, user.id),
          isNull(realtorClients.deletedAt)
        )
      )
      .returning({ id: realtorClients.id })

    if (result.length === 0) {
      throw notFound('Client', input.id)
    }

    return { success: true }
  })
