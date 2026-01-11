import { Button as ReactEmailButton } from '@react-email/components'
import type { ReactNode } from 'react'

import { components } from '../../styles'

export interface ButtonProps {
  href: string
  children: ReactNode
}

/**
 * Styled CTA button for email templates.
 *
 * @example
 * <Button href="https://example.com/login">Sign in</Button>
 */
export function Button({ href, children }: ButtonProps) {
  return (
    <ReactEmailButton href={href} style={components.button}>
      {children}
    </ReactEmailButton>
  )
}
