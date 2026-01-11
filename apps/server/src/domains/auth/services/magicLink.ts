import crypto from 'node:crypto'

import type { Database } from '@server/db'
import type { MagicLink, User } from '@server/db/schema'
import { magicLinks, users } from '@server/db/schema'
import { emailService } from '@server/infra/email'
import { and, eq, isNull } from 'drizzle-orm'

const DEFAULT_EXPIRY_HOURS = 24

function generateMagicToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export interface CreateMagicLinkOptions {
  userId: string
  expiresAt?: Date
  createdBy?: string
  redirectUrl?: string
  ipAddress?: string
}

export type ValidateMagicLinkResult =
  | { success: true; magicLink: MagicLink; user: User }
  | { success: false; error: 'not_found' | 'expired' | 'already_used' }

export interface MagicLinkService {
  create(db: Database, options: CreateMagicLinkOptions): Promise<string>
  validate(db: Database, token: string): Promise<ValidateMagicLinkResult>
  consume(db: Database, token: string): Promise<void>
}

/**
 * Service for managing magic link authentication tokens.
 *
 * @example
 * const token = await magicLinkService.create(db, { userId: 'abc', redirectUrl: '/events' })
 * const result = await magicLinkService.validate(db, token)
 * if (result.success) {
 *   await magicLinkService.consume(db, token)
 * }
 */
export const magicLinkService: MagicLinkService = {
  async create(db, options) {
    const token = generateMagicToken()
    const expiresAt =
      options.expiresAt ?? new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000)

    await db.insert(magicLinks).values({
      userId: options.userId,
      token,
      expiresAt,
      createdBy: options.createdBy,
      redirectUrl: options.redirectUrl,
      ipAddress: options.ipAddress,
    })

    return token
  },

  async validate(db, token) {
    const [result] = await db
      .select({
        magicLink: magicLinks,
        user: users,
      })
      .from(magicLinks)
      .innerJoin(users, eq(magicLinks.userId, users.id))
      .where(eq(magicLinks.token, token))
      .limit(1)

    if (!result) {
      return { success: false, error: 'not_found' }
    }

    if (result.magicLink.usedAt) {
      return { success: false, error: 'already_used' }
    }

    if (result.magicLink.expiresAt < new Date()) {
      return { success: false, error: 'expired' }
    }

    return { success: true, magicLink: result.magicLink, user: result.user }
  },

  async consume(db, token) {
    await db
      .update(magicLinks)
      .set({ usedAt: new Date() })
      .where(and(eq(magicLinks.token, token), isNull(magicLinks.usedAt)))
  },
}

/**
 * Sends a magic link email to the specified address.
 *
 * @example
 * await sendMagicLinkEmail('user@example.com', 'https://app.com/login/magic?token=abc', new Date())
 */
export async function sendMagicLinkEmail(
  email: string,
  url: string,
  expiresAt?: Date
): Promise<void> {
  const expiryText = expiresAt
    ? `This link expires on ${expiresAt.toLocaleString()}.`
    : 'This link expires in 24 hours.'

  await emailService.send({
    to: email,
    subject: 'Your magic sign-in link',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Sign in to Concord</h1>
        <p style="font-size: 16px; color: #666; margin-bottom: 24px;">
          Click the button below to sign in to your account. ${expiryText}
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Sign in to Concord
          </a>
        </div>
        <p style="font-size: 14px; color: #999;">
          Or copy and paste this URL into your browser:<br>
          <a href="${url}" style="color: #666; word-break: break-all;">${url}</a>
        </p>
        <p style="font-size: 14px; color: #999; margin-top: 24px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Sign in to Concord\n\nClick the link below to sign in:\n${url}\n\n${expiryText}\n\nIf you didn't request this link, you can safely ignore this email.`,
    dev: {
      type: 'magic_link',
      to: email,
      url,
      expiresAt: expiresAt?.toISOString(),
    },
  })
}
