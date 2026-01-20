import { TRPCError } from '@trpc/server'
import { and, desc, eq, isNull } from 'drizzle-orm'
import ms from 'ms'
import { describe, expect, it } from 'vitest'

import { magicLinks, otpCodes, users } from '../db/schema'
import { createTestUser, getCurrentTx } from './db'
import { createTestClient } from './trpc-client'

describe('Magic Link Authentication', () => {
  const testUser = {
    email: 'magiclink@example.com',
    name: 'Magic Link User',
  }

  describe('login with type: magic', () => {
    it('throws USER_NOT_FOUND for non-existent email', async () => {
      const client = createTestClient()

      // Request for non-existent email
      try {
        await client.trpc.auth.login({
          email: 'nonexistent@example.com',
          type: 'magic',
        })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('NOT_FOUND')
      }
    })

    it('creates a magic link token for existing user', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request magic link via login
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })

      // Verify token was created in database
      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, userId))
        .orderBy(desc(magicLinks.createdAt))
        .limit(1)

      expect(magicLink).toBeDefined()
      expect(magicLink.token).toHaveLength(64)
      expect(magicLink.usedAt).toBeNull()
      expect(magicLink.createdBy).toBeNull() // user-initiated
    })

    it('stores redirect URL when provided', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request magic link with redirect
      await client.trpc.auth.login({
        email: testUser.email,
        type: 'magic',
        redirectUrl: '/dashboard',
      })

      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, userId))
        .orderBy(desc(magicLinks.createdAt))
        .limit(1)

      expect(magicLink.redirectUrl).toBe('/dashboard')
    })

    it('uses default 24h expiration', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request magic link (uses default 24h expiry)
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })

      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, userId))
        .orderBy(desc(magicLinks.createdAt))
        .limit(1)

      const expectedExpiry = Date.now() + ms('24 hours')
      const actualExpiry = magicLink.expiresAt.getTime()

      // Allow 5 second tolerance
      expect(actualExpiry).toBeGreaterThan(expectedExpiry - 5000)
      expect(actualExpiry).toBeLessThan(expectedExpiry + 5000)
    })
  })

  describe('generateMagicLink', () => {
    it('requires authentication', async () => {
      const client = createTestClient()

      // Create a user directly to have a valid userId
      const user = await createTestUser(testUser)

      // Try to generate without authentication
      try {
        await client.trpc.auth.generateMagicLink({ userId: user.id })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('UNAUTHORIZED')
      }
    })

    it('generates a magic link URL for existing user', async () => {
      const client = createTestClient()

      // Create admin user and log them in
      const adminUser = await createTestUser({ email: 'admin@example.com', name: 'Admin User' })
      await client.trpc.auth.login({ email: adminUser.email })
      const adminOtp = await getLatestOtpCode(adminUser.email)
      const { token } = await client.trpc.auth.verifyOtp({
        email: adminUser.email,
        code: adminOtp,
      })
      client.setToken(token)

      // Create target user
      const targetUser = await createTestUser(testUser)

      // Generate magic link
      const result = await client.trpc.auth.generateMagicLink({
        userId: targetUser.id,
      })

      expect(result.url).toContain('/login/magic?token=')
      expect(result.expiresAt).toBeDefined()

      // Verify createdBy is set to admin
      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, targetUser.id))
        .limit(1)

      expect(magicLink.createdBy).toBe(adminUser.id)
    })

    it('returns NOT_FOUND for non-existent user', async () => {
      const client = createTestClient()

      // Create and login user
      const user = await createTestUser(testUser)
      await client.trpc.auth.login({ email: user.email })
      const otp = await getLatestOtpCode(user.email)
      const { token } = await client.trpc.auth.verifyOtp({ email: user.email, code: otp })
      client.setToken(token)

      // Try to generate for non-existent user
      try {
        await client.trpc.auth.generateMagicLink({
          userId: '00000000-0000-0000-0000-000000000000',
        })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('NOT_FOUND')
      }
    })

    it('includes redirect URL in generated link', async () => {
      const client = createTestClient()

      // Create and login user
      const user = await createTestUser(testUser)
      await client.trpc.auth.login({ email: user.email })
      const otp = await getLatestOtpCode(user.email)
      const { token } = await client.trpc.auth.verifyOtp({ email: user.email, code: otp })
      client.setToken(token)

      // Generate magic link with redirect
      const result = await client.trpc.auth.generateMagicLink({
        userId: user.id,
        redirectUrl: '/onboarding',
      })

      expect(result.url).toContain('redirect=%2Fonboarding')
    })
  })

  describe('verifyMagicLink', () => {
    it('creates a session for valid magic link token', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request magic link via login
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })

      // Get the token from database
      const magicToken = await getLatestMagicLinkToken(userId)

      // Verify the magic link
      const result = await client.trpc.auth.verifyMagicLink({
        token: magicToken,
      })

      expect(result.user).toMatchObject({
        id: userId,
        email: testUser.email,
        name: testUser.name,
      })
      expect(result.token).toBeDefined()
      expect(result.token).toHaveLength(64)
    })

    it('returns redirectUrl from magic link', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request magic link with redirect
      await client.trpc.auth.login({
        email: testUser.email,
        type: 'magic',
        redirectUrl: '/dashboard',
      })

      const magicToken = await getLatestMagicLinkToken(userId)

      const result = await client.trpc.auth.verifyMagicLink({
        token: magicToken,
      })

      expect(result.redirectUrl).toBe('/dashboard')
    })

    it('marks magic link as used after verification', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request and verify magic link
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })
      const magicToken = await getLatestMagicLinkToken(userId)
      await client.trpc.auth.verifyMagicLink({ token: magicToken })

      // Check it's marked as used
      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.token, magicToken))
        .limit(1)

      expect(magicLink.usedAt).not.toBeNull()
    })

    it('rejects already-used magic link', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request and verify magic link once
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })
      const magicToken = await getLatestMagicLinkToken(userId)
      await client.trpc.auth.verifyMagicLink({ token: magicToken })

      // Try to use it again
      try {
        await client.trpc.auth.verifyMagicLink({ token: magicToken })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('BAD_REQUEST')
        expect(trpcError.message).toContain('already been used')
      }
    })

    it('rejects expired magic link', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request magic link via login
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })
      const magicToken = await getLatestMagicLinkToken(userId)

      // Manually expire the token in database
      const db = getCurrentTx()
      await db
        .update(magicLinks)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(magicLinks.token, magicToken))

      // Try to verify expired token
      try {
        await client.trpc.auth.verifyMagicLink({ token: magicToken })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('BAD_REQUEST')
        expect(trpcError.message).toContain('expired')
      }
    })

    it('rejects invalid magic link token', async () => {
      const client = createTestClient()

      // Try with a fake token (64 chars)
      try {
        await client.trpc.auth.verifyMagicLink({
          token: 'a'.repeat(64),
        })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('NOT_FOUND')
        expect(trpcError.message).toContain('Invalid magic link')
      }
    })

    it('session token works for authenticated requests', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // Request and verify magic link
      await client.trpc.auth.login({ email: testUser.email, type: 'magic' })
      const magicToken = await getLatestMagicLinkToken(userId)
      const { token } = await client.trpc.auth.verifyMagicLink({
        token: magicToken,
      })

      // Use the new session token
      client.setToken(token)
      const me = await client.trpc.auth.me()

      expect(me).toMatchObject({
        id: userId,
        email: testUser.email,
        name: testUser.name,
      })
    })
  })

  describe('Full magic link flow', () => {
    it('completes the full magic link authentication lifecycle', async () => {
      const client = createTestClient()

      // Create a non-waitlist user directly
      const user = await createTestUser(testUser)
      const userId = user.id

      // 1. Login with OTP first
      await client.trpc.auth.login({ email: testUser.email })
      const loginOtp = await getLatestOtpCode(testUser.email)
      const { token: initialToken } = await client.trpc.auth.verifyOtp({
        email: testUser.email,
        code: loginOtp,
      })

      // 2. Logout
      client.setToken(initialToken)
      await client.trpc.auth.logout()
      client.clearToken()

      // 3. Login with magic link instead of OTP
      await client.trpc.auth.login({
        email: testUser.email,
        type: 'magic',
        redirectUrl: '/dashboard',
      })

      // 4. Get token and verify
      const magicToken = await getLatestMagicLinkToken(userId)
      const {
        user: verifiedUser,
        token,
        redirectUrl,
      } = await client.trpc.auth.verifyMagicLink({
        token: magicToken,
      })

      expect(verifiedUser.email).toBe(testUser.email)
      expect(token).toBeDefined()
      expect(redirectUrl).toBe('/dashboard')

      // 5. Verify session works
      client.setToken(token)
      const me = await client.trpc.auth.me()
      expect(me?.email).toBe(testUser.email)

      // 6. Final logout
      await client.trpc.auth.logout()
      client.clearToken()

      const meAfterLogout = await client.trpc.auth.me()
      expect(meAfterLogout).toBeNull()
    })
  })
})

/**
 * Fetches the most recent unused OTP code for a user from the database by email.
 */
async function getLatestOtpCode(email: string): Promise<string> {
  const db = getCurrentTx()

  // First get user by email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user) throw new Error(`No user found with email ${email}`)

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.userId, user.id), isNull(otpCodes.usedAt)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1)

  if (!otp) throw new Error(`No OTP found for user ${email}`)
  return otp.code
}

/**
 * Fetches the most recent unused magic link token for a user from the database.
 */
async function getLatestMagicLinkToken(userId: string): Promise<string> {
  const db = getCurrentTx()
  const [magicLink] = await db
    .select()
    .from(magicLinks)
    .where(and(eq(magicLinks.userId, userId), isNull(magicLinks.usedAt)))
    .orderBy(desc(magicLinks.createdAt))
    .limit(1)

  if (!magicLink) throw new Error(`No magic link found for user ${userId}`)
  return magicLink.token
}
