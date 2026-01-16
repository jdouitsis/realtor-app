import type { Database } from '@server/db'
import { realtorClients, users } from '@server/db/schema'
import { alreadyExists } from '@server/lib/errors'
import { and, eq, isNull } from 'drizzle-orm'

import { magicLinkService, sendMagicLinkEmail } from '../../auth/services/magicLink'

export interface InviteClientOptions {
  realtorId: string
  email: string
  name: string
  redirectUrl: string
  ipAddress?: string
}

export interface InviteClientResult {
  clientId: string
}

export interface ActivateClientOptions {
  realtorId: string
  clientId: string
}

/**
 * Service for inviting clients to the platform.
 *
 * @example
 * const { clientId } = await clientInviteService.invite(db, {
 *   realtorId: 'realtor-123',
 *   email: 'client@example.com',
 *   name: 'John Doe',
 *   redirectUrl: '/forms',
 * })
 */
export const clientInviteService = {
  /**
   * Invites a client by email. Creates the user if they don't exist,
   * creates the realtor-client relationship, and sends a magic link.
   *
   * @throws ALREADY_EXISTS if the realtor already has this client
   */
  async invite(db: Database, options: InviteClientOptions): Promise<InviteClientResult> {
    const { realtorId, email, name, redirectUrl, ipAddress } = options

    // 1. Check if relationship already exists
    const [existing] = await db
      .select({ id: realtorClients.id })
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(
        and(
          eq(realtorClients.realtorId, realtorId),
          eq(users.email, email),
          isNull(realtorClients.deletedAt)
        )
      )
      .limit(1)

    if (existing) {
      throw alreadyExists('Client', existing.id)
    }

    // 2. Find or create user
    let [clientUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!clientUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name,
          isRealtor: false,
        })
        .returning()
      clientUser = newUser
    }

    // 3. Create realtor-client relationship
    const [relationship] = await db
      .insert(realtorClients)
      .values({
        realtorId,
        clientId: clientUser.id,
        status: 'invited',
      })
      .returning()

    // 4. Send magic link with redirect
    const { magicUrl } = await magicLinkService.create(db, {
      userId: clientUser.id,
      redirectUrl,
      createdBy: realtorId,
      ipAddress,
    })
    await sendMagicLinkEmail(clientUser.email, magicUrl)

    return {
      clientId: relationship.id,
    }
  },

  /**
   * Activates a client relationship by transitioning status from 'invited' to 'active'.
   * Called when a client consumes their invitation magic link.
   *
   * @example
   * await clientInviteService.activate(db, { realtorId: 'realtor-123', clientId: 'client-456' })
   */
  async activate(db: Database, options: ActivateClientOptions): Promise<void> {
    const { realtorId, clientId } = options

    await db
      .update(realtorClients)
      .set({ status: 'active' })
      .where(
        and(
          eq(realtorClients.realtorId, realtorId),
          eq(realtorClients.clientId, clientId),
          eq(realtorClients.status, 'invited')
        )
      )
  },
}
