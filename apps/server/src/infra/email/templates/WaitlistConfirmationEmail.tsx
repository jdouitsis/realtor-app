import { Text } from '@react-email/components'

import { text } from '../styles'

import { EmailLayout } from './components/EmailLayout'

export interface WaitlistConfirmationEmailProps {
  name: string
}

/**
 * Waitlist confirmation email template.
 * Sent when a user joins the waitlist.
 *
 * @example
 * <WaitlistConfirmationEmail name="John" />
 */
export function WaitlistConfirmationEmail({ name }: WaitlistConfirmationEmailProps) {
  return (
    <EmailLayout preview="You're on the waitlist!">
      <Text style={text.heading}>You're on the waitlist!</Text>
      <Text style={text.description}>
        Hi {name}, thanks for signing up! We're excited to have you on the waitlist.
      </Text>
      <Text style={text.description}>
        We'll notify you as soon as early access opens. In the meantime, keep an eye on your inbox.
      </Text>
    </EmailLayout>
  )
}
