import { env } from '@server/env'
import type { Request, Response } from 'express'

export const SESSION_COOKIE_NAME = 'session'

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: env.isDev ? 'lax' : 'none',
    path: '/',
    maxAge: SESSION_DURATION_MS,
    ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
  })
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: env.isDev ? 'lax' : 'none',
    path: '/',
    ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
  })
}

export function getSessionToken(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined
  const token = cookies?.[SESSION_COOKIE_NAME]
  return typeof token === 'string' ? token : null
}
