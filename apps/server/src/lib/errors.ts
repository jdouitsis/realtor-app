import type { AppErrorCode } from '@concordpoint/shared/errors'
import { TRPCError } from '@trpc/server'

// Re-export from shared package for convenience
export { AppErrorCode } from '@concordpoint/shared/errors'

/** Maps application error codes to tRPC error codes */
const APP_CODE_TO_TRPC: Record<AppErrorCode, TRPCError['code']> = {
  INVALID_CREDENTIALS: 'UNAUTHORIZED',
  EMAIL_ALREADY_EXISTS: 'CONFLICT',
  SESSION_EXPIRED: 'UNAUTHORIZED',
  USER_NOT_FOUND: 'NOT_FOUND',
  OTP_EXPIRED: 'BAD_REQUEST',
  OTP_INVALID: 'BAD_REQUEST',
  OTP_MAX_ATTEMPTS: 'TOO_MANY_REQUESTS',
  REQUEST_NEW_OTP: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'CONFLICT',
}

interface AppErrorOptions {
  code: AppErrorCode
  message: string
  cause?: unknown
}

/**
 * Application error class that extends TRPCError with business-specific codes.
 *
 * @example
 * throw new AppError({
 *   code: 'INVALID_CREDENTIALS',
 *   message: 'Invalid email or password',
 * })
 */
export class AppError extends TRPCError {
  public readonly appCode: AppErrorCode

  constructor({ code, message, cause }: AppErrorOptions) {
    super({
      code: APP_CODE_TO_TRPC[code],
      message,
      cause,
    })
    this.appCode = code
  }
}

/**
 * Factory function for authentication errors.
 *
 * @example
 * throw authError('INVALID_CREDENTIALS', 'Invalid email or password')
 */
export function authError(
  code:
    | 'INVALID_CREDENTIALS'
    | 'EMAIL_ALREADY_EXISTS'
    | 'SESSION_EXPIRED'
    | 'USER_NOT_FOUND'
    | 'OTP_EXPIRED'
    | 'OTP_INVALID'
    | 'OTP_MAX_ATTEMPTS',
  message: string
) {
  return new AppError({ code, message })
}

/**
 * Factory function for "not found" errors.
 *
 * @example
 * throw notFound('User', userId)
 * // → "User with id abc123 not found"
 *
 * throw notFound('User')
 * // → "User not found"
 */
export function notFound(resource: string, id?: string) {
  return new AppError({
    code: 'NOT_FOUND',
    message: id ? `${resource} with id ${id} not found` : `${resource} not found`,
  })
}

/**
 * Factory function for "already exists" errors.
 *
 * @example
 * throw alreadyExists('Account', 'user@example.com')
 */
export function alreadyExists(resource: string, identifier?: string) {
  return new AppError({
    code: 'ALREADY_EXISTS',
    message: identifier
      ? `${resource} "${identifier}" already exists`
      : `${resource} already exists`,
  })
}
