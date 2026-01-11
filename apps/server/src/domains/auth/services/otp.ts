import crypto from 'node:crypto'

import type { Database } from '@server/db'
import { otpCodes, users } from '@server/db/schema'
import { emailService } from '@server/infra/email'
import { renderEmail } from '@server/infra/email/render'
import { and, desc, eq, isNull } from 'drizzle-orm'
import ms from 'ms'

const OTP_EXPIRY_MS = ms('15 minutes')
const OTP_EXPIRY_MINUTES = 15
const MAX_ATTEMPTS = 5

export function generateOtp(): string {
  // Generate a 6-digit code
  return crypto.randomInt(100000, 999999).toString()
}

export async function createOtpCode(db: Database, userId: string): Promise<string> {
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS)

  await db.insert(otpCodes).values({
    userId,
    code,
    expiresAt,
  })

  return code
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const { html, text } = await renderEmail({
    type: 'otp',
    code,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  })

  await emailService.send({
    to: email,
    subject: 'Your verification code',
    html,
    text,
    dev: {
      type: 'otp',
      to: email,
      code,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    },
  })
}

export type VerifyOtpResult =
  | { success: true; userId: string }
  | { success: false; error: 'expired' | 'invalid' | 'max_attempts' }

export async function verifyOtpCode(
  db: Database,
  userId: string,
  code: string
): Promise<VerifyOtpResult> {
  // Find the most recent unused OTP for this user
  const [otpRecord] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.userId, userId), isNull(otpCodes.usedAt)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1)

  if (!otpRecord) {
    return { success: false, error: 'invalid' }
  }

  // Check if max attempts exceeded
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: 'max_attempts' }
  }

  // Check if expired
  if (otpRecord.expiresAt < new Date()) {
    return { success: false, error: 'expired' }
  }

  // Increment attempts
  await db
    .update(otpCodes)
    .set({ attempts: otpRecord.attempts + 1 })
    .where(eq(otpCodes.id, otpRecord.id))

  // Check if code matches
  if (otpRecord.code !== code) {
    // Check if we just hit max attempts
    if (otpRecord.attempts + 1 >= MAX_ATTEMPTS) {
      return { success: false, error: 'max_attempts' }
    }
    return { success: false, error: 'invalid' }
  }

  // Mark as used
  await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otpRecord.id))

  return { success: true, userId: otpRecord.userId }
}

export async function invalidateUserOtps(db: Database, userId: string): Promise<void> {
  // Mark all unused OTPs as used
  await db
    .update(otpCodes)
    .set({ usedAt: new Date() })
    .where(and(eq(otpCodes.userId, userId), isNull(otpCodes.usedAt)))
}

export async function getUserEmail(db: Database, userId: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return user?.email ?? null
}

/**
 * Get user ID by email address.
 *
 * @example
 * const userId = await getUserIdByEmail(db, 'user@example.com')
 */
export async function getUserIdByEmail(db: Database, email: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user?.id ?? null
}
