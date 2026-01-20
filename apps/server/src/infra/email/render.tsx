import { render } from '@react-email/components'
import { match } from 'ts-pattern'

import type { MapToUnionWithTypeFieldAdded } from '@app/shared/types'

import { MagicLinkEmail, type MagicLinkEmailProps } from './templates/MagicLinkEmail'
import { OtpEmail, type OtpEmailProps } from './templates/OtpEmail'
import {
  WaitlistConfirmationEmail,
  type WaitlistConfirmationEmailProps,
} from './templates/WaitlistConfirmationEmail'

/**
 * Map of template types to their props.
 */
type EmailTemplatePropsMap = {
  otp: OtpEmailProps
  magicLink: MagicLinkEmailProps
  waitlistConfirmation: WaitlistConfirmationEmailProps
}

export type EmailTemplateType = keyof EmailTemplatePropsMap

/**
 * Discriminated union of all email templates with their props.
 * Each variant includes a `type` field for pattern matching.
 *
 * @example
 * // Type is: { type: 'otp'; code: string; expiresInMinutes: number }
 * //        | { type: 'magicLink'; url: string; expiresAt?: Date }
 */
export type EmailTemplateInput = MapToUnionWithTypeFieldAdded<
  EmailTemplatePropsMap,
  EmailTemplateType
>

interface RenderResult {
  html: string
  text: string
}

/**
 * Renders an email template to HTML and plain text.
 * Uses ts-pattern for exhaustive template matching.
 *
 * @example
 * const { html, text } = await renderEmail({
 *   type: 'otp',
 *   code: '123456',
 *   expiresInMinutes: 15,
 * })
 */
export async function renderEmail(input: EmailTemplateInput): Promise<RenderResult> {
  const element = match(input)
    .with({ type: 'otp' }, (data) => (
      <OtpEmail code={data.code} expiresInMinutes={data.expiresInMinutes} />
    ))
    .with({ type: 'magicLink' }, (data) => (
      <MagicLinkEmail url={data.url} expiresAt={data.expiresAt} />
    ))
    .with({ type: 'waitlistConfirmation' }, (data) => (
      <WaitlistConfirmationEmail name={data.name} />
    ))
    .exhaustive()

  const html = await render(element)
  const text = await render(element, { plainText: true })

  return { html, text }
}
