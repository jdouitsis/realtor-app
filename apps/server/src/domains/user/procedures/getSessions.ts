import { sessions } from '@server/db/schema'
import { protectedProcedure } from '@server/trpc'
import { eq } from 'drizzle-orm'
import { UAParser } from 'ua-parser-js'
import { z } from 'zod'

import { getSessionToken } from '../../auth/lib/cookies'

const sessionOutput = z.object({
  id: z.string(),
  device: z.string().nullable(),
  browser: z.string().nullable(),
  os: z.string().nullable(),
  ipAddress: z.string().nullable(),
  isCurrent: z.boolean(),
  createdAt: z.date(),
  lastActiveAt: z.date(),
})

const getSessionsOutput = z.object({
  sessions: z.array(sessionOutput),
})

/**
 * Parses a user agent string into a human-readable device description.
 *
 * @example
 * parseUserAgent('Mozilla/5.0 (Macintosh...)') // { browser: 'Chrome 120', os: 'macOS 14' }
 */
function parseUserAgent(userAgent: string | null): {
  device: string | null
  browser: string | null
  os: string | null
} {
  if (!userAgent) {
    return { device: null, browser: null, os: null }
  }

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const browser = result.browser.name
    ? `${result.browser.name}${result.browser.version ? ` ${result.browser.version.split('.')[0]}` : ''}`
    : null

  const os = result.os.name
    ? `${result.os.name}${result.os.version ? ` ${result.os.version}` : ''}`
    : null

  const device = result.device.vendor
    ? `${result.device.vendor} ${result.device.model || ''}`.trim()
    : null

  return { device, browser, os }
}

/**
 * Returns all active sessions for the current user.
 *
 * @example
 * const { sessions } = await trpc.user.getSessions.query()
 */
export const getSessions = protectedProcedure
  .output(getSessionsOutput)
  .query(async ({ ctx: { db, req, user } }) => {
    const currentToken = getSessionToken(req)

    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(sessions.lastActiveAt)

    // Filter out expired and invalidated sessions, then map to output format
    const now = new Date()
    const activeSessions = userSessions
      .filter((s) => s.expiresAt > now && s.invalidatedAt === null)
      .map((session) => {
        const parsed = parseUserAgent(session.userAgent)
        return {
          id: session.id,
          device: parsed.device,
          browser: parsed.browser,
          os: parsed.os,
          ipAddress: session.ipAddress,
          isCurrent: session.token === currentToken,
          createdAt: session.createdAt,
          lastActiveAt: session.lastActiveAt,
        }
      })
      .reverse() // Most recent first

    return { sessions: activeSessions }
  })
