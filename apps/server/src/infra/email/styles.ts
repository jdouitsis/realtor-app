/**
 * Centralized styles for all email templates.
 * Organized into logical groups for maintainability.
 */

// Design tokens
const colors = {
  primary: '#18181b',
  secondary: '#666666',
  muted: '#999999',
  background: '#ffffff',
  surface: '#f4f4f5',
} as const

const fonts = {
  base: 'system-ui, -apple-system, sans-serif',
  mono: 'monospace',
} as const

// Layout styles
export const layout = {
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.base,
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  content: {
    marginBottom: '24px',
  },
  center: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
} as const

// Typography styles
export const text = {
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '16px',
    color: colors.primary,
  },
  description: {
    fontSize: '16px',
    color: colors.secondary,
    marginBottom: '24px',
  },
  footer: {
    fontSize: '14px',
    color: colors.muted,
    marginTop: '24px',
  },
  fallback: {
    fontSize: '14px',
    color: colors.muted,
  },
  link: {
    color: colors.secondary,
    wordBreak: 'break-all' as const,
  },
} as const

// Component styles
export const components = {
  button: {
    display: 'inline-block',
    backgroundColor: colors.primary,
    color: colors.background,
    padding: '12px 24px',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: 500,
    fontSize: '16px',
  },
  codeBox: {
    backgroundColor: colors.surface,
    padding: '24px',
    textAlign: 'center' as const,
    borderRadius: '8px',
  },
  code: {
    fontSize: '32px',
    fontWeight: 700,
    letterSpacing: '8px',
    fontFamily: fonts.mono,
    color: colors.primary,
    margin: 0,
  },
} as const

// Export all styles as a single object for convenience
export const emailStyles = {
  colors,
  fonts,
  layout,
  text,
  components,
} as const
