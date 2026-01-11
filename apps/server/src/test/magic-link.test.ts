import { TRPCError } from '@trpc/server'
import { and, desc, eq, isNull } from 'drizzle-orm'
import ms from 'ms'
import { describe, expect, it } from 'vitest'

import { magicLinks, otpCodes, users } from '../db/schema'
import { getCurrentTx } from './db'
import { createTestClient } from './trpc-client'

describe('Magic Link Authentication', () => {
  const testUser = {
    email: 'magiclink@example.com',
    name: 'Magic Link User',
  }

  describe('requestMagicLink', () => {
    it('returns success message regardless of whether email exists', async () => {
      const client = createTestClient()

      // Request for non-existent email
      const result = await client.trpc.auth.requestMagicLink({
        email: 'nonexistent@example.com',
      })

      expect(result.message).toContain('If an account exists')
    })

    it('creates a magic link token for existing user', async () => {
      const client = createTestClient()

      // First register a user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id

      // Request magic link
      await client.trpc.auth.requestMagicLink({ email: testUser.email })

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

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id

      // Request magic link with redirect
      await client.trpc.auth.requestMagicLink({
        email: testUser.email,
        redirectUrl: '/events/123',
      })

      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, userId))
        .orderBy(desc(magicLinks.createdAt))
        .limit(1)

      expect(magicLink.redirectUrl).toBe('/events/123')
    })

    it('respects custom expiration time', async () => {
      const client = createTestClient()

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id

      // Request magic link with 48 hour expiry
      await client.trpc.auth.requestMagicLink({
        email: testUser.email,
        expiresInHours: 48,
      })

      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, userId))
        .orderBy(desc(magicLinks.createdAt))
        .limit(1)

      const expectedExpiry = Date.now() + ms('48 hours')
      const actualExpiry = magicLink.expiresAt.getTime()

      // Allow 5 second tolerance
      expect(actualExpiry).toBeGreaterThan(expectedExpiry - 5000)
      expect(actualExpiry).toBeLessThan(expectedExpiry + 5000)
    })
  })

  describe('generateMagicLink', () => {
    it('requires authentication', async () => {
      const client = createTestClient()

      // Register a user first to have a valid userId
      const { email } = await client.trpc.auth.register(testUser)
      const userId = await getUserIdByEmail(email)

      // Try to generate without authentication
      try {
        await client.trpc.auth.generateMagicLink({ userId })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError)
        const trpcError = error as TRPCError
        expect(trpcError.code).toBe('UNAUTHORIZED')
      }
    })

    it('generates a magic link URL for existing user', async () => {
      const client = createTestClient()

      // Register and login admin user
      const adminEmail = 'admin@example.com'
      await client.trpc.auth.register({
        email: adminEmail,
        name: 'Admin User',
      })
      const adminOtp = await getLatestOtpCode(adminEmail)
      const { user: adminUser, token } = await client.trpc.auth.verifyOtp({
        email: adminEmail,
        code: adminOtp,
      })
      const adminId = adminUser.id
      client.setToken(token)

      // Register target user
      const { email: targetEmail } = await client.trpc.auth.register(testUser)
      const targetId = await getUserIdByEmail(targetEmail)

      // Generate magic link
      const result = await client.trpc.auth.generateMagicLink({
        userId: targetId,
      })

      expect(result.url).toContain('/login/magic?token=')
      expect(result.expiresAt).toBeDefined()

      // Verify createdBy is set to admin
      const db = getCurrentTx()
      const [magicLink] = await db
        .select()
        .from(magicLinks)
        .where(eq(magicLinks.userId, targetId))
        .limit(1)

      expect(magicLink.createdBy).toBe(adminId)
    })

    it('returns NOT_FOUND for non-existent user', async () => {
      const client = createTestClient()

      // Register and login
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { token } = await client.trpc.auth.verifyOtp({ email, code: otp })
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

      // Register and login
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user, token } = await client.trpc.auth.verifyOtp({ email, code: otp })
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

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id
      client.clearToken()

      // Request magic link
      await client.trpc.auth.requestMagicLink({ email: testUser.email })

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

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id
      client.clearToken()

      // Request magic link with redirect
      await client.trpc.auth.requestMagicLink({
        email: testUser.email,
        redirectUrl: '/events/456',
      })

      const magicToken = await getLatestMagicLinkToken(userId)

      const result = await client.trpc.auth.verifyMagicLink({
        token: magicToken,
      })

      expect(result.redirectUrl).toBe('/events/456')
    })

    it('marks magic link as used after verification', async () => {
      const client = createTestClient()

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id
      client.clearToken()

      // Request and verify magic link
      await client.trpc.auth.requestMagicLink({ email: testUser.email })
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

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id
      client.clearToken()

      // Request and verify magic link once
      await client.trpc.auth.requestMagicLink({ email: testUser.email })
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

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id
      client.clearToken()

      // Request magic link
      await client.trpc.auth.requestMagicLink({ email: testUser.email })
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

      // Register and verify user
      const { email } = await client.trpc.auth.register(testUser)
      const otp = await getLatestOtpCode(email)
      const { user } = await client.trpc.auth.verifyOtp({ email, code: otp })
      const userId = user.id
      client.clearToken()

      // Request and verify magic link
      await client.trpc.auth.requestMagicLink({ email: testUser.email })
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

      // 1. Register a new user (via OTP first time)
      const { email } = await client.trpc.auth.register(testUser)
      const registerOtp = await getLatestOtpCode(email)
      const { user, token: initialToken } = await client.trpc.auth.verifyOtp({
        email,
        code: registerOtp,
      })
      const userId = user.id

      // 2. Logout
      client.setToken(initialToken)
      await client.trpc.auth.logout()
      client.clearToken()

      // 3. Request magic link instead of OTP
      await client.trpc.auth.requestMagicLink({
        email: testUser.email,
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
 * Gets a user's ID by their email address.
 */
async function getUserIdByEmail(email: string): Promise<string> {
  const db = getCurrentTx()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user) throw new Error(`No user found with email ${email}`)
  return user.id
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
