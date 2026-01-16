import { realtorClients, users } from '@server/db/schema'
import { protectedProcedure } from '@server/trpc'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

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
 * const clients = await trpc.clients.list.query({})
 */
export const list = protectedProcedure
  .input(z.object({}))
  .output(listOutput)
  .query(async ({ ctx: { db, user } }) => {
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
      .where(and(eq(realtorClients.realtorId, user.id), isNull(realtorClients.deletedAt)))
      .orderBy(desc(realtorClients.createdAt))

    return results
  })
