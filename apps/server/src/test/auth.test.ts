import { TRPCError } from '@trpc/server'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { otpCodes } from '../db/schema'
import { getCurrentTx } from './db'
import { createTestClient } from './trpc-client'

describe('Auth flow: register -> verify -> me -> logout -> login -> verify -> logout', () => {
  const testUser = {
    email: 'test@example.com',
    name: 'Test User',
  }

  it('completes the full authentication lifecycle', async () => {
    const client = createTestClient()

    // 1. Register a new user
    const registerResult = await client.trpc.auth.register(testUser)

    expect(registerResult.message).toContain('Check your email')
    expect(registerResult.userId).toBeDefined()

    const userId = registerResult.userId

    // 2. Get OTP from database and verify
    const registerOtp = await getLatestOtpCode(userId)
    const verifyResult = await client.trpc.auth.verifyOtp({
      userId,
      code: registerOtp,
    })

    expect(verifyResult.user).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    // Session cookie should be set
    expect(client.getSessionCookie()).toBeDefined()

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

    // 5. Verify user is no longer authenticated via /me
    const meAfterLogout = await client.trpc.auth.me()

    expect(meAfterLogout).toBeNull()

    // 6. Login with same email
    const loginResult = await client.trpc.auth.login({ email: testUser.email })

    expect(loginResult.message).toContain('Check your email')
    expect(loginResult.userId).toBe(userId)

    // 7. Get new OTP and verify
    const loginOtp = await getLatestOtpCode(userId)
    const verifyLoginResult = await client.trpc.auth.verifyOtp({
      userId,
      code: loginOtp,
    })

    expect(verifyLoginResult.user).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    // New session cookie should be set
    expect(client.getSessionCookie()).toBeDefined()

    // 8. Verify user is authenticated again
    const meReauth = await client.trpc.auth.me()

    expect(meReauth).toMatchObject({
      id: userId,
      email: testUser.email,
      name: testUser.name,
    })

    // 9. Final logout
    const finalLogout = await client.trpc.auth.logout()

    expect(finalLogout.success).toBe(true)

    // 10. Confirm logged out
    const meFinal = await client.trpc.auth.me()

    expect(meFinal).toBeNull()
  })

  it('prevents duplicate registration with same email', async () => {
    const client = createTestClient()

    // Register first time
    await client.trpc.auth.register(testUser)

    // Try to register again with same email
    await expect(client.trpc.auth.register(testUser)).rejects.toThrow(TRPCError)

    try {
      await client.trpc.auth.register(testUser)
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      const trpcError = error as TRPCError
      expect(trpcError.code).toBe('CONFLICT')
    }
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

    // Register user
    const { userId } = await client.trpc.auth.register(testUser)

    // Try with wrong code
    try {
      await client.trpc.auth.verifyOtp({ userId, code: '000000' })
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
 * Fetches the most recent unused OTP code for a user from the database.
 * Used in tests to bypass email verification.
 */
async function getLatestOtpCode(userId: string): Promise<string> {
  const db = getCurrentTx()
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.userId, userId), isNull(otpCodes.usedAt)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1)

  if (!otp) throw new Error(`No OTP found for user ${userId}`)
  return otp.code
}
