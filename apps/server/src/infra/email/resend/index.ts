import { env } from '@server/env'
import { logger } from '@server/lib/logger'
import { Resend } from 'resend'

import type { EmailService, SendEmailOptions, SendEmailResult } from '../types'

// Only create Resend client if API key is configured
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export const resendEmailService: EmailService = {
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    // Skip sending if no API key configured
    if (!resend) {
      if (options.dev) {
        logger.debug({ dev: options.dev }, 'Email (dev mode)')
      } else {
        logger.debug({ to: options.to, subject: options.subject }, 'Email skipped (no API key)')
      }
      return { success: true, messageId: 'dev-skip' }
    }

    try {
      const { data, error } = await resend.emails.send({
        from: env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      if (error) {
        logger.error({ error }, 'Email send failed')
        return { success: false, error: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (err) {
      logger.error({ error: err }, 'Email send error')
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  },
}
