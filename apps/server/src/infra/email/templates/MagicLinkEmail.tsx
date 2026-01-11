import { Link, Section, Text } from '@react-email/components'

import { layout, text } from '../styles'

import { Button } from './components/Button'
import { EmailLayout } from './components/EmailLayout'

export interface MagicLinkEmailProps {
  url: string
  expiresAt?: Date
}

/**
 * Magic link sign-in email template.
 * Displays a CTA button and fallback URL for passwordless login.
 *
 * @example
 * <MagicLinkEmail url="https://app.com/auth?token=abc" expiresAt={new Date()} />
 */
export function MagicLinkEmail({ url, expiresAt }: MagicLinkEmailProps) {
  const expiryText = expiresAt
    ? `This link expires on ${expiresAt.toLocaleString()}.`
    : 'This link expires in 24 hours.'

  return (
    <EmailLayout preview="Sign in to Concord">
      <Text style={text.heading}>Sign in to Concord</Text>
      <Text style={text.description}>
        Click the button below to sign in to your account. {expiryText}
      </Text>
      <Section style={layout.center}>
        <Button href={url}>Sign in to Concord</Button>
      </Section>
      <Text style={text.fallback}>
        Or copy and paste this URL into your browser:
        <br />
        <Link href={url} style={text.link}>
          {url}
        </Link>
      </Text>
    </EmailLayout>
  )
}
