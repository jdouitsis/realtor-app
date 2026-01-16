import { realtorClients, users } from '@server/db/schema'
import { protectedProcedure } from '@server/trpc'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

const listInput = z.object({
  status: z.enum(['invited', 'active', 'inactive']).optional(),
})

const clientOutput = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(['invited', 'active', 'inactive']),
  createdAt: z.date(),
})

const listOutput = z.array(clientOutput)

/**
 * Returns the list of clients for the authenticated realtor.
 *
 * @example
 * const clients = await trpc.clients.list.query({ status: 'active' })
 */
export const list = protectedProcedure
  .input(listInput)
  .output(listOutput)
  .query(async ({ input, ctx: { db, user } }) => {
    const conditions = [eq(realtorClients.realtorId, user.id), isNull(realtorClients.deletedAt)]

    if (input.status) {
      conditions.push(eq(realtorClients.status, input.status))
    }

    const results = await db
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
      .where(and(...conditions))
      .orderBy(desc(realtorClients.createdAt))

    return results
  })
