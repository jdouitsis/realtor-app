import { Section, Text } from '@react-email/components'

import { components, text } from '../styles'

import { EmailLayout } from './components/EmailLayout'

export interface OtpEmailProps {
  code: string
  expiresInMinutes: number
}

/**
 * OTP verification email template.
 * Displays a 6-digit verification code with expiry information.
 *
 * @example
 * <OtpEmail code="123456" expiresInMinutes={15} />
 */
export function OtpEmail({ code, expiresInMinutes }: OtpEmailProps) {
  return (
    <EmailLayout preview={`Your verification code is ${code}`}>
      <Text style={text.heading}>Your verification code</Text>
      <Text style={text.description}>
        Enter this code to sign in to your account. It expires in {expiresInMinutes} minutes.
      </Text>
      <Section style={components.codeBox}>
        <Text style={components.code}>{code}</Text>
      </Section>
    </EmailLayout>
  )
}
