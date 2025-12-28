import type { Request, Response } from 'express'

import { createRequestLogger } from '../lib/logger'
import { appRouter } from '../routers'
import { t } from '../trpc/init'
import { getCurrentTx } from './db'

const createCaller = t.createCallerFactory(appRouter)

/**
 * A typed tRPC caller for integration testing.
 * Calls procedures directly without HTTP, but still runs all middlewares.
 * Manages Authorization header to simulate session state between calls.
 */
export class TestClient {
  private token: string | null = null

  private createContext() {
    const token = this.token

    // Mock request with Authorization header
    const req = {
      cookies: {},
      headers: {
        'user-agent': 'TestClient/1.0',
        ...(token && { authorization: `Bearer ${token}` }),
      },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    // Mock response (no longer needed for cookies, but kept for interface)
    const res = {
      cookie: () => {},
      clearCookie: () => {},
    } as unknown as Response

    return {
      req,
      res,
      db: getCurrentTx(),
      requestId: crypto.randomUUID().replaceAll('-', '_'),
      log: createRequestLogger({ requestId: 'test' }),
    }
  }

  /**
   * Returns a typed tRPC caller.
   * Creates a fresh context for each access, using accumulated token.
   */
  get trpc() {
    return createCaller(this.createContext())
  }

  /**
   * Sets the auth token (simulates storing token after login).
   */
  setToken(token: string) {
    this.token = token
  }

  /**
   * Clears the auth token (simulates logout).
   */
  clearToken() {
    this.token = null
  }

  /**
   * Returns the current auth token if present.
   */
  getToken(): string | null {
    return this.token
  }
}

/**
 * Creates a new TestClient for typed tRPC testing.
 * Uses createCaller to call procedures directly (no HTTP overhead).
 *
 * @example
 * const client = createTestClient()
 * const { userId } = await client.trpc.auth.register({ email: 'test@example.com', name: 'Test' })
 * const otp = await getLatestOtpCode(userId)
 * const { user, token } = await client.trpc.auth.verifyOtp({ userId, code: otp })
 * client.setToken(token)
 */
export function createTestClient() {
  return new TestClient()
}
