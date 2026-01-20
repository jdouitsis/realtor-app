import { TRPCError } from '@trpc/server'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { otpCodes, users } from '../db/schema'
import { createTestUser, getCurrentTx } from './db'
import { createTestClient } from './trpc-client'

describe('Waitlist registration', () => {
  const testUser = {
    email: 'waitlist@example.com',
    name: 'Waitlist User',
  }

  it('adds new users to the waitlist', async () => {
    const client = createTestClient()

    const result = await client.trpc.auth.register(testUser)

    expect(result.message).toContain('waitlist')
    expect(result.email).toBe(testUser.email)

    // Verify user is on waitlist in database
    const db = getCurrentTx()
    const [user] = await db.select().from(users).where(eq(users.email, testUser.email)).limit(1)

    expect(user).toBeDefined()
    expect(user.isWaitlist).toBe(true)
  })

  it('blocks waitlist users from logging in', async () => {
    const client = createTestClient()

    // Register (adds to waitlist)
    await client.trpc.auth.register(testUser)

    // Try to login
    try {
      await client.trpc.auth.login({ email: testUser.email })
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      const trpcError = error as TRPCError
      expect(trpcError.code).toBe('FORBIDDEN')
    }
  })

  it('prevents duplicate registration with same email', async () => {
    const client = createTestClient()

    // Register first time
    await client.trpc.auth.register(testUser)

    // Try to register again with same email
    try {
      await client.trpc.auth.register(testUser)
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      const trpcError = error as TRPCError
      expect(trpcError.code).toBe('CONFLICT')
    }
  })
})

describe('Auth flow: login -> verify -> me -> logout', () => {
  const testUser = {
    email: 'test@example.com',
    name: 'Test User',
  }

  it('completes the full authentication lifecycle', async () => {
    const client = createTestClient()

    // Create a non-waitlist user directly
    const user = await createTestUser(testUser)
    const userId = user.id

    // 1. Login with email
    const loginResult = await client.trpc.auth.login({ email: testUser.email })

    expect(loginResult.message).toContain('Check your email')
    expect(loginResult.email).toBe(testUser.email)

    // 2. Get OTP from database and verify
    const loginOtp = await getLatestOtpCode(testUser.email)
    const verifyResult = await client.trpc.auth.verifyOtp({
      email: testUser.email,
      code: loginOtp,
    })

    expect(verifyResult.user).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    // Token should be returned
    expect(verifyResult.token).toBeDefined()
    client.setToken(verifyResult.token)

    // 3. Verify user is authenticated via /me
    const meResult = await client.trpc.auth.me()

    expect(meResult).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    // 4. Logout
    const logoutResult = await client.trpc.auth.logout()

    expect(logoutResult.success).toBe(true)
    client.clearToken()

    // 5. Verify user is no longer authenticated via /me
    const meAfterLogout = await client.trpc.auth.me()

    expect(meAfterLogout).toBeNull()

    // 6. Login again with same email
    const reloginResult = await client.trpc.auth.login({ email: testUser.email })

    expect(reloginResult.message).toContain('Check your email')

    // 7. Get new OTP and verify
    const reloginOtp = await getLatestOtpCode(testUser.email)
    const verifyReloginResult = await client.trpc.auth.verifyOtp({
      email: testUser.email,
      code: reloginOtp,
    })

    expect(verifyReloginResult.user).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    client.setToken(verifyReloginResult.token)

    // 8. Verify user is authenticated again
    const meReauth = await client.trpc.auth.me()

    expect(meReauth).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    // 9. Final logout
    await client.trpc.auth.logout()
    client.clearToken()

    // 10. Confirm logged out
    const meFinal = await client.trpc.auth.me()

    expect(meFinal).toBeNull()
  })

  it('rejects login for non-existent user', async () => {
    const client = createTestClient()

    try {
      await client.trpc.auth.login({ email: 'nonexistent@example.com' })
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      const trpcError = error as TRPCError
      expect(trpcError.code).toBe('NOT_FOUND')
    }
  })

  it('rejects invalid OTP code', async () => {
    const client = createTestClient()

    // Create user and request OTP
    await createTestUser(testUser)
    await client.trpc.auth.login({ email: testUser.email })

    // Try with wrong code
    try {
      await client.trpc.auth.verifyOtp({ email: testUser.email, code: '999999' })
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      const trpcError = error as TRPCError
      expect(trpcError.code).toBe('BAD_REQUEST')
    }
  })

  it('requires authentication for logout', async () => {
    const client = createTestClient()

    try {
      await client.trpc.auth.logout()
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      const trpcError = error as TRPCError
      expect(trpcError.code).toBe('UNAUTHORIZED')
    }
  })
})

/**
 * Fetches the most recent unused OTP code for a user from the database by email.
 * Used in tests to bypass email verification.
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
