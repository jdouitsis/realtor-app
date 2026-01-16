import { magicLinks, realtorClients, users } from '@server/db/schema'
import { getCurrentTx } from '@server/test/db'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { clientInviteService } from './invite'

describe('clientInviteService', () => {
  describe('invite', () => {
    it('creates a new user when email does not exist', async () => {
      const db = getCurrentTx()

      // Create a realtor
      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      const result = await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'newclient@example.com',
        name: 'New Client',
        redirectUrl: '/forms',
      })

      expect(result.clientId).toBeDefined()

      // Verify user was created
      const [clientUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'newclient@example.com'))
        .limit(1)

      expect(clientUser).toBeDefined()
      expect(clientUser.name).toBe('New Client')
      expect(clientUser.isRealtor).toBe(false)
    })

    it('uses existing user when email already exists', async () => {
      const db = getCurrentTx()

      // Create a realtor and an existing client user
      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      const [existingClient] = await db
        .insert(users)
        .values({ email: 'existing@example.com', name: 'Existing User', isRealtor: false })
        .returning()

      const result = await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'existing@example.com',
        name: 'Different Name',
        redirectUrl: '/forms',
      })

      expect(result.clientId).toBeDefined()

      // Verify no duplicate user was created
      const clientUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, 'existing@example.com'))

      expect(clientUsers).toHaveLength(1)
      expect(clientUsers[0].id).toBe(existingClient.id)
      // Original name should be preserved
      expect(clientUsers[0].name).toBe('Existing User')
    })

    it('creates realtorClients relationship with invited status', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      const result = await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      const [relationship] = await db
        .select()
        .from(realtorClients)
        .where(eq(realtorClients.id, result.clientId))
        .limit(1)

      expect(relationship).toBeDefined()
      expect(relationship.realtorId).toBe(realtor.id)
      expect(relationship.status).toBe('invited')
      expect(relationship.deletedAt).toBeNull()
    })

    it('creates magic link with createdBy set to realtorId', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      // Get the client user
      const [clientUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'client@example.com'))
        .limit(1)

      // Verify magic link was created with correct createdBy
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, clientUser.id))
        .limit(1)

      expect(magicLink).toBeDefined()
      expect(magicLink.createdBy).toBe(realtor.id)
      expect(magicLink.redirectUrl).toBe('/forms')
    })

    it('throws ALREADY_EXISTS if realtor already has this client', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      // First invite succeeds
      const firstResult = await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      // Second invite should fail
      try {
        await clientInviteService.invite(db, {
          realtorId: realtor.id,
          email: 'client@example.com',
          name: 'Client',
          redirectUrl: '/forms',
        })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('CONFLICT')
        expect(trpcError.message).toContain(firstResult.clientId)
      }
    })

    it('allows inviting same client to different realtors', async () => {
      const db = getCurrentTx()

      const [realtor1] = await db
        .insert(users)
        .values({ email: 'realtor1@example.com', name: 'Realtor 1', isRealtor: true })
        .returning()

      const [realtor2] = await db
        .insert(users)
        .values({ email: 'realtor2@example.com', name: 'Realtor 2', isRealtor: true })
        .returning()

      const result1 = await clientInviteService.invite(db, {
        realtorId: realtor1.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      const result2 = await clientInviteService.invite(db, {
        realtorId: realtor2.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      expect(result1.clientId).toBeDefined()
      expect(result2.clientId).toBeDefined()
      expect(result1.clientId).not.toBe(result2.clientId)
    })

    it('allows re-inviting after soft delete', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      // First invite
      const firstResult = await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      // Soft delete the relationship
      await db
        .update(realtorClients)
        .set({ deletedAt: new Date() })
        .where(eq(realtorClients.id, firstResult.clientId))

      // Second invite should succeed
      const secondResult = await clientInviteService.invite(db, {
        realtorId: realtor.id,
        email: 'client@example.com',
        name: 'Client',
        redirectUrl: '/forms',
      })

      expect(secondResult.clientId).toBeDefined()
      expect(secondResult.clientId).not.toBe(firstResult.clientId)
    })
  })

  describe('activate', () => {
    it('transitions status from invited to active', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      const [client] = await db
        .insert(users)
        .values({ email: 'client@example.com', name: 'Client', isRealtor: false })
        .returning()

      const [relationship] = await db
        .insert(realtorClients)
        .values({ realtorId: realtor.id, clientId: client.id, status: 'invited' })
        .returning()

      await clientInviteService.activate(db, {
        realtorId: realtor.id,
        clientId: client.id,
      })

      const [updated] = await db
        .select()
        .from(realtorClients)
        .where(eq(realtorClients.id, relationship.id))
        .limit(1)

      expect(updated.status).toBe('active')
    })

    it('does not change status if already active', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      const [client] = await db
        .insert(users)
        .values({ email: 'client@example.com', name: 'Client', isRealtor: false })
        .returning()

      const [relationship] = await db
        .insert(realtorClients)
        .values({ realtorId: realtor.id, clientId: client.id, status: 'active' })
        .returning()

      // Should not throw, just do nothing
      await clientInviteService.activate(db, {
        realtorId: realtor.id,
        clientId: client.id,
      })

      const [updated] = await db
        .select()
        .from(realtorClients)
        .where(eq(realtorClients.id, relationship.id))
        .limit(1)

      expect(updated.status).toBe('active')
    })

    it('does not change status if inactive', async () => {
      const db = getCurrentTx()

      const [realtor] = await db
        .insert(users)
        .values({ email: 'realtor@example.com', name: 'Realtor', isRealtor: true })
        .returning()

      const [client] = await db
        .insert(users)
        .values({ email: 'client@example.com', name: 'Client', isRealtor: false })
        .returning()

      const [relationship] = await db
        .insert(realtorClients)
        .values({ realtorId: realtor.id, clientId: client.id, status: 'inactive' })
        .returning()

      await clientInviteService.activate(db, {
        realtorId: realtor.id,
        clientId: client.id,
      })

      const [updated] = await db
        .select()
        .from(realtorClients)
        .where(eq(realtorClients.id, relationship.id))
        .limit(1)

      // Status should remain inactive
      expect(updated.status).toBe('inactive')
    })

    it('does nothing if relationship does not exist', async () => {
      const db = getCurrentTx()

      // Should not throw, just do nothing (uses valid UUIDs that don't exist)
      await clientInviteService.activate(db, {
        realtorId: '00000000-0000-0000-0000-000000000001',
        clientId: '00000000-0000-0000-0000-000000000002',
      })

      // No assertion needed - test passes if no error thrown
    })
  })
})
