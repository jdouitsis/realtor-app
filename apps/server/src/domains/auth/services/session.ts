import { and, eq, gt } from 'drizzle-orm'

import type { Database } from '@server/db'
import { type User, sessions, users } from '@server/db/schema'
import crypto from 'node:crypto'

const SESSION_DURATION_DAYS = 30

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export interface SessionService {
  create(db: Database, userId: string): Promise<string>
  validate(db: Database, token: string): Promise<User | null>
  invalidate(db: Database, token: string): Promise<void>
  invalidateAllForUser(db: Database, userId: string): Promise<void>
}

export const sessionService: SessionService = {
  async create(db, userId) {
    const token = generateToken()
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)

    await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
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
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1)

    if (!result) {
      return null
    }

    // Update last active timestamp
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, result.session.id))

    return result.user
  },

  async invalidate(db, token) {
    await db.delete(sessions).where(eq(sessions.token, token))
  },

  async invalidateAllForUser(db, userId) {
    await db.delete(sessions).where(eq(sessions.userId, userId))
  },
}
