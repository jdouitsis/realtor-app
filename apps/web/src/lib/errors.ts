import { TRPCClientError } from '@trpc/client'

import type { AppErrorCode } from '@finance/shared/errors'

/** Shape of tRPC error data from our server's errorFormatter */
interface TRPCErrorData {
  code?: string
  appCode?: string
  requestId?: string
  zodError?: {
    fieldErrors?: Record<string, string[]>
  } | null
}

/**
 * Type-safe user-friendly messages for app-specific error codes.
 * This Record type ensures compile-time failure if a new error code
 * is added to @finance/shared/errors without a corresponding message here.
 */
const APP_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'This resource already exists.',
}

/**
 * User-friendly messages for tRPC built-in error codes.
 * These are loosely typed since they come from the tRPC library.
 */
const TRPC_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CONFLICT: 'This resource already exists.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
}

/**
 * Combined user messages for error lookup.
 * App-specific codes take precedence over tRPC codes.
 */
const USER_MESSAGES: Record<string, string> = {
  ...TRPC_MESSAGES,
  ...APP_ERROR_MESSAGES,
}

export interface ParsedError {
  /** User-friendly message for display in UI */
  userMessage: string
  /** Raw server message for debugging/logging only - do not show to users */
  debugMessage: string
  /** tRPC error code (e.g., "UNAUTHORIZED", "NOT_FOUND") */
  code?: string
  /** App-specific error code (e.g., "INVALID_CREDENTIALS") */
  appCode?: string
  /** Request ID for debugging/support */
  requestId?: string
  /** Field-level validation errors from Zod */
  fieldErrors?: Record<string, string[]>
}

/**
 * Parses any error into a structured format for display and debugging.
 *
 * @example
 * const mutation = trpc.auth.login.useMutation({
 *   onError: (error) => {
 *     const parsed = parseError(error)
 *     setServerError(parsed.userMessage)
 *     console.debug('Request ID:', parsed.requestId)
 *   },
 * })
 */
export function parseError(error: unknown): ParsedError {
  if (error instanceof TRPCClientError) {
    const data = error.data as TRPCErrorData | undefined
    const code = data?.code
    const appCode = data?.appCode
    const requestId = data?.requestId
    const zodError = data?.zodError

    // Prefer appCode for user message lookup, fall back to tRPC code
    const lookupCode = appCode ?? code

    return {
      userMessage: (lookupCode && USER_MESSAGES[lookupCode]) || error.message,
      debugMessage: error.message,
      code,
      appCode,
      requestId,
      fieldErrors: zodError?.fieldErrors,
    }
  }

  return {
    userMessage: 'An unexpected error occurred.',
    debugMessage: String(error),
  }
}

/**
 * Extracts field errors from a parsed error for form validation.
 *
 * @example
 * const { fieldErrors } = parseError(error)
 * if (fieldErrors?.email) {
 *   form.setError('email', { message: fieldErrors.email[0] })
 * }
 */
export function getFieldError(parsed: ParsedError, field: string): string | undefined {
  return parsed.fieldErrors?.[field]?.[0]
}
