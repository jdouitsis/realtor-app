export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  /** Debug data to log when no API key is configured (instead of full HTML) */
  dev?: Record<string, unknown>
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailService {
  send(options: SendEmailOptions): Promise<SendEmailResult>
}
