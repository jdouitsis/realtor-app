import crypto from 'node:crypto'

import type { Database } from '@server/db'
import { otpCodes, users } from '@server/db/schema'
import { emailService } from '@server/infra/email'
import { and, eq, isNull } from 'drizzle-orm'

const OTP_EXPIRY_MINUTES = 15
const MAX_ATTEMPTS = 5

export function generateOtp(): string {
  // Generate a 6-digit code
  return crypto.randomInt(100000, 999999).toString()
}

export async function createOtpCode(db: Database, userId: string): Promise<string> {
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await db.insert(otpCodes).values({
    userId,
    code,
    expiresAt,
  })

  return code
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await emailService.send({
    to: email,
    subject: 'Your verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Your verification code</h1>
        <p style="font-size: 16px; color: #666; margin-bottom: 24px;">
          Enter this code to sign in to your account. It expires in ${OTP_EXPIRY_MINUTES} minutes.
        </p>
        <div style="background: #f4f4f5; padding: 24px; text-align: center; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
            ${code}
          </span>
        </div>
        <p style="font-size: 14px; color: #999; margin-top: 24px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Your verification code is: ${code}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
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
    .orderBy(otpCodes.createdAt)
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
