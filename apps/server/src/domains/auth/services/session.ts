import crypto from 'node:crypto'

import type { Database } from '@server/db'
import type { Session, User } from '@server/db/schema'
import { sessions, users } from '@server/db/schema'
import { and, eq, gt, isNull } from 'drizzle-orm'
import ms from 'ms'

const SESSION_DURATION_MS = ms('30 days')

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export interface CreateSessionOptions {
  userAgent?: string
  ipAddress?: string
}

export interface ValidatedSession {
  user: User
  session: Session
}

export interface SessionService {
  create(db: Database, userId: string, options?: CreateSessionOptions): Promise<string>
  validate(db: Database, token: string): Promise<ValidatedSession | null>
  invalidate(db: Database, token: string): Promise<void>
  invalidateAllForUser(db: Database, userId: string): Promise<void>
  updateOtpVerified(db: Database, sessionId: string): Promise<void>
}

export const sessionService: SessionService = {
  async create(db, userId, options) {
    const token = generateToken()
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

    await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
      userAgent: options?.userAgent,
      ipAddress: options?.ipAddress,
    })

    return token
  },

  async validate(db, token) {
    const [result] = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date()),
          isNull(sessions.invalidatedAt)
        )
      )
      .limit(1)

    if (!result) {
      return null
    }

    // Update last active timestamp
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, result.session.id))

    return { user: result.user, session: result.session }
  },

  async invalidate(db, token) {
    await db.update(sessions).set({ invalidatedAt: new Date() }).where(eq(sessions.token, token))
  },

  async invalidateAllForUser(db, userId) {
    await db
      .update(sessions)
      .set({ invalidatedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.invalidatedAt)))
  },

  async updateOtpVerified(db, sessionId) {
    await db
      .update(sessions)
      .set({ lastOtpVerifiedAt: new Date() })
      .where(eq(sessions.id, sessionId))
  },
}
