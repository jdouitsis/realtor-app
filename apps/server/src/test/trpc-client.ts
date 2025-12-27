import type { Request, Response } from 'express'

import { createRequestLogger } from '../lib/logger'
import { appRouter } from '../routers'
import { t } from '../trpc/init'
import { getCurrentTx } from './db'

const createCaller = t.createCallerFactory(appRouter)

/**
 * A typed tRPC caller for integration testing.
 * Calls procedures directly without HTTP, but still runs all middlewares.
 * Manages mock cookies to simulate session state between calls.
 */
export class TestClient {
  private cookies: Record<string, string> = {}

  private createContext() {
    const cookies = this.cookies

    // Mock request that reads from our cookie store
    const req = {
      cookies,
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request

    // Mock response that writes to our cookie store
    const res = {
      cookie: (name: string, value: string) => {
        cookies[name] = value
      },
      clearCookie: (name: string) => {
        delete cookies[name]
      },
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
   * Creates a fresh context for each access, using accumulated cookies.
   */
  get trpc() {
    return createCaller(this.createContext())
  }

  /**
   * Clears all cookies (simulates a fresh browser session).
   */
  clearCookies() {
    this.cookies = {}
  }

  /**
   * Returns the current session cookie if present.
   */
  getSessionCookie(): string | undefined {
    return this.cookies['session']
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
 * const { user } = await client.trpc.auth.verifyOtp({ userId, code: otp })
 */
export function createTestClient() {
  return new TestClient()
}
