import { realtorClients } from '@server/db/schema'
import { notFound } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

const updateNicknameInput = z.object({
  id: z.string().uuid(),
  nickname: z.string().max(100).nullable(),
})

const updateNicknameOutput = z.object({
  nickname: z.string().nullable(),
})

/**
 * Updates a client's nickname. Pass null to remove the nickname.
 *
 * @example
 * await trpc.clients.updateNickname.mutate({ id: 'abc-123', nickname: 'Johnny' })
 */
export const updateNickname = protectedProcedure
  .input(updateNicknameInput)
  .output(updateNicknameOutput)
  .mutation(async ({ input, ctx: { db, user } }) => {
    const result = await db
      .update(realtorClients)
      .set({ nickname: input.nickname })
      .where(
        and(
          eq(realtorClients.id, input.id),
          eq(realtorClients.realtorId, user.id),
          isNull(realtorClients.deletedAt)
        )
      )
      .returning({ nickname: realtorClients.nickname })

    if (result.length === 0) {
      throw notFound('Client', input.id)
    }

    return { nickname: result[0].nickname }
  })
