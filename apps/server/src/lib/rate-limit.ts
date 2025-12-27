import { RateLimiterMemory } from 'rate-limiter-flexible'

export type RateLimiter = RateLimiterMemory

interface RateLimitConfig {
  /** Unique prefix for this limiter's keys */
  prefix: string
  /** Number of requests allowed in the duration window */
  points: number
  /** Duration window in seconds */
  duration: number
}

/** Pre-configured rate limit settings */
const rateLimitConfigs = {
  /** 5 attempts per minute - for login/register */
  auth: { prefix: 'auth', points: 5, duration: 60 },

  /** 5 attempts per 15 minutes - for OTP verification */
  otpVerify: { prefix: 'otp_verify', points: 5, duration: 900 },

  /** 3 requests per 5 minutes - for OTP resend */
  otpRequest: { prefix: 'otp_request', points: 3, duration: 300 },
} as const satisfies Record<string, RateLimitConfig>

/** Available rate limit types */
export type RateLimitType = keyof typeof rateLimitConfigs

/**
 * Gets the rate limit configuration for the given type.
 *
 * @example
 * getRateLimitConfig('auth') // { prefix: 'auth', points: 5, duration: 60 }
 */
export function getRateLimitConfig(type: RateLimitType): RateLimitConfig {
  return rateLimitConfigs[type]
}
