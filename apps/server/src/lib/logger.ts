import pino from 'pino'

import { env } from '../env'

/**
 * Sensitive fields to redact in production logs.
 * Supports nested paths and wildcards.
 */
const REDACT_PATHS = [
  'input.password',
  'input.code',
  'input.token',
  'input.sessionToken',
  'input.otp',
  '*.password',
  '*.code',
  '*.token',
  '*.sessionToken',
]

/**
 * Root Pino logger instance.
 * Use this for application-level logging (startup, shutdown, etc).
 *
 * @example
 * logger.info({ port: 3001 }, 'Server started')
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  redact: env.isDev ? undefined : REDACT_PATHS,
})

export type Logger = pino.Logger

/**
 * Creates a child logger with request context attached.
 * Each request should get its own child logger for tracing.
 *
 * @example
 * const log = createRequestLogger({ requestId: 'abc123' })
 * log.info('Processing request')
 */
export function createRequestLogger(context: {
  requestId: string
  path?: string
  userId?: string
}): Logger {
  return logger.child(context)
}
