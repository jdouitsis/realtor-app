import ms from 'ms'

import { MagicLinkEmail, type MagicLinkEmailProps } from './MagicLinkEmail'
import { OtpEmail, type OtpEmailProps } from './OtpEmail'
import {
  WaitlistConfirmationEmail,
  type WaitlistConfirmationEmailProps,
} from './WaitlistConfirmationEmail'

export { MagicLinkEmail, type MagicLinkEmailProps } from './MagicLinkEmail'
export { OtpEmail, type OtpEmailProps } from './OtpEmail'
export {
  WaitlistConfirmationEmail,
  type WaitlistConfirmationEmailProps,
} from './WaitlistConfirmationEmail'

/**
 * Registry of all email templates with metadata for the dev preview page.
 */
export const emailTemplates = {
  otp: {
    component: OtpEmail,
    name: 'OTP Verification',
    description: 'Sent when user needs to verify with a 6-digit code',
    defaultProps: { code: '123456', expiresInMinutes: 15 } satisfies OtpEmailProps,
  },
  magicLink: {
    component: MagicLinkEmail,
    name: 'Magic Link',
    description: 'Passwordless sign-in link',
    defaultProps: {
      url: 'https://example.com/auth/magic?token=abc123',
      expiresAt: new Date(Date.now() + ms('24 hours')),
    } satisfies MagicLinkEmailProps,
  },
  waitlistConfirmation: {
    component: WaitlistConfirmationEmail,
    name: 'Waitlist Confirmation',
    description: 'Sent when a user joins the waitlist',
    defaultProps: { name: 'John' } satisfies WaitlistConfirmationEmailProps,
  },
} as const

export type EmailTemplateKey = keyof typeof emailTemplates
