import { realtorClients, users } from '@server/db/schema'
import { notFound } from '@server/lib/errors'
import { protectedProcedure } from '@server/trpc'
import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

const getByIdInput = z.object({
  id: z.string().uuid(),
})

const getByIdOutput = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(['invited', 'active', 'inactive']),
  createdAt: z.date(),
})

/**
 * Returns a single client's details by relationship ID.
 *
 * @example
 * const client = await trpc.clients.getById.query({ id: 'abc-123' })
 */
export const getById = protectedProcedure
  .input(getByIdInput)
  .output(getByIdOutput)
  .query(async ({ input, ctx: { db, user } }) => {
    const [result] = await db
      .select({
        id: realtorClients.id,
        clientId: users.id,
        name: users.name,
        email: users.email,
        status: realtorClients.status,
        createdAt: realtorClients.createdAt,
      })
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(
        and(
          eq(realtorClients.id, input.id),
          eq(realtorClients.realtorId, user.id),
          isNull(realtorClients.deletedAt)
        )
      )
      .limit(1)

    if (!result) {
      throw notFound('Client', input.id)
    }

    return result
  })
