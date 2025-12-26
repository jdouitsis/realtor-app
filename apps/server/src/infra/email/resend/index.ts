import { env } from '@server/env'
import { Resend } from 'resend'

import type { EmailService, SendEmailOptions, SendEmailResult } from '../types'

// Only create Resend client if API key is configured
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export const resendEmailService: EmailService = {
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    // Skip sending if no API key configured (log to console instead)
    if (!resend) {
      if (options.dev) {
        console.log('[Email]', options.dev)
      } else {
        console.log('[Email] Skipping send (no API key):', {
          to: options.to,
          subject: options.subject,
        })
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
        console.error('[Email] Send failed:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (err) {
      console.error('[Email] Send error:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  },
}
