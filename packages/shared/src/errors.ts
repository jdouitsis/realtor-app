/**
 * Application-specific error codes for business logic errors.
 * These are shared between server and client.
 *
 * IMPORTANT: When adding a new error code:
 * 1. Add it to this object
 * 2. The client will fail to compile until you add a user message in
 *    apps/web/src/lib/errors.ts
 */
export const AppErrorCode = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
} as const

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode]
