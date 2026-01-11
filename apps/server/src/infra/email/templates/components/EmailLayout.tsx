import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'
import type { ReactNode } from 'react'

import { layout, text } from '../../styles'

export interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

/**
 * Shared layout wrapper for all email templates.
 * Provides consistent styling, header, and footer.
 *
 * @example
 * <EmailLayout preview="Your verification code is 123456">
 *   <Text>Email content here</Text>
 * </EmailLayout>
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={layout.body}>
        <Container style={layout.container}>
          <Section style={layout.content}>{children}</Section>
          <Text style={text.footer}>
            If you didn&apos;t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
