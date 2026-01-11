# SOP: Email Templates

This document explains how to create, modify, and preview email templates using React Email.

## Architecture

```
renderEmail({ type: 'otp', code: '123456', expiresInMinutes: 15 })
    |
    v
ts-pattern match on template name
    |
    v
React Email component (OtpEmail)
    |
    v
render() → { html: string, text: string }
    |
    v
emailService.send({ html, text, ... })
    |
    v
Resend API
```

## Key Files

| File                                                   | Purpose                                     |
| ------------------------------------------------------ | ------------------------------------------- |
| `apps/server/src/infra/email/styles.ts`                | Centralized styles (colors, typography)     |
| `apps/server/src/infra/email/templates/`               | All email template components               |
| `apps/server/src/infra/email/templates/index.ts`       | Template registry with metadata             |
| `apps/server/src/infra/email/render.tsx`               | Type-safe render utility with ts-pattern    |
| `apps/server/src/infra/email/templates/components/`    | Shared components (EmailLayout, Button)     |
| `apps/server/src/routes/dev/emails.tsx`                | Dev preview routes                          |

## Previewing Emails

During development, email templates are previewable at:

```
http://localhost:3001/dev/emails
```

The server logs this URL on startup:

```
Server started { port: 3001, env: 'development' }
Email preview available { url: 'http://localhost:3001/dev/emails' }
```

Click any template to preview it. Override props via query params:

```
http://localhost:3001/dev/emails/otp?code=999999
```

## Adding a New Email Template

### Step 1: Create the Template Component

Create a new file in `apps/server/src/infra/email/templates/`:

```tsx
// NewFeatureEmail.tsx
import { Text } from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

export interface NewFeatureEmailProps {
  userName: string
  featureName: string
}

export function NewFeatureEmail({ userName, featureName }: NewFeatureEmailProps) {
  return (
    <EmailLayout preview={`Check out ${featureName}`}>
      <Text style={{ fontSize: '24px', fontWeight: 600 }}>
        Hi {userName}!
      </Text>
      <Text style={{ fontSize: '16px', color: '#666' }}>
        We just launched {featureName}. Check it out!
      </Text>
    </EmailLayout>
  )
}
```

### Step 2: Add to Template Registry

Update `apps/server/src/infra/email/templates/index.ts`:

```tsx
import { NewFeatureEmail, type NewFeatureEmailProps } from './NewFeatureEmail'

export { NewFeatureEmail, type NewFeatureEmailProps } from './NewFeatureEmail'

export const emailTemplates = {
  // ... existing templates
  newFeature: {
    component: NewFeatureEmail,
    name: 'New Feature Announcement',
    description: 'Sent when a new feature is launched',
    defaultProps: {
      userName: 'John',
      featureName: 'Dark Mode',
    } satisfies NewFeatureEmailProps,
  },
} as const
```

### Step 3: Add to Render Utility

Update `apps/server/src/infra/email/render.tsx`:

```tsx
import { NewFeatureEmail, type NewFeatureEmailProps } from './templates/NewFeatureEmail'

// Add to props map
type EmailTemplatePropsMap = {
  otp: OtpEmailProps
  magicLink: MagicLinkEmailProps
  newFeature: NewFeatureEmailProps  // Add this
}

// Add to match expression
export async function renderEmail(input: EmailTemplateInput): Promise<RenderResult> {
  const element = match(input)
    .with({ type: 'otp' }, (data) => (
      <OtpEmail code={data.code} expiresInMinutes={data.expiresInMinutes} />
    ))
    .with({ type: 'magicLink' }, (data) => (
      <MagicLinkEmail url={data.url} expiresAt={data.expiresAt} />
    ))
    .with({ type: 'newFeature' }, (data) => (  // Add this
      <NewFeatureEmail userName={data.userName} featureName={data.featureName} />
    ))
    .exhaustive()
  // ...
}
```

### Step 4: Use in Your Code

```typescript
import { renderEmail } from '@server/infra/email/render'
import { emailService } from '@server/infra/email'

const { html, text } = await renderEmail({
  type: 'newFeature',
  userName: user.name,
  featureName: 'Dark Mode',
})

await emailService.send({
  to: user.email,
  subject: 'Check out our new feature!',
  html,
  text,
})
```

### Step 5: Verify

1. Run the server: `pnpm dev`
2. Go to `http://localhost:3001/dev/emails`
3. Verify your new template appears in the list
4. Click to preview it

## Shared Components

### EmailLayout

Wraps all email content with consistent styling and footer:

```tsx
import { EmailLayout } from './components/EmailLayout'

<EmailLayout preview="Preview text for inbox">
  {/* Your content */}
</EmailLayout>
```

The `preview` prop appears in email client previews (before opening the email).

### Button

Styled CTA button:

```tsx
import { Button } from './components/Button'

<Button href="https://example.com/action">
  Click Here
</Button>
```

## React Email Components

React Email provides components optimized for email clients:

| Component   | Usage                                      |
| ----------- | ------------------------------------------ |
| `Text`      | Paragraphs and headings                    |
| `Link`      | Hyperlinks                                 |
| `Section`   | Container for grouping content             |
| `Container` | Centered content wrapper                   |
| `Html`      | Root element (used in EmailLayout)         |
| `Head`      | Metadata (used in EmailLayout)             |
| `Body`      | Body wrapper (used in EmailLayout)         |
| `Preview`   | Inbox preview text (used in EmailLayout)   |

See [React Email docs](https://react.email/docs/components/html) for full list.

## Styling

All email styles are centralized in `apps/server/src/infra/email/styles.ts`.

### Style Categories

```typescript
import { layout, text, components } from '../styles'

// Layout styles
layout.body        // Base body styles
layout.container   // Centered container
layout.content     // Content section
layout.center      // Centered section (for buttons)

// Typography styles
text.heading       // Page headings
text.description   // Body text
text.footer        // Footer text
text.fallback      // Muted helper text
text.link          // Link styles

// Component styles
components.button  // CTA button
components.codeBox // OTP code container
components.code    // OTP code text
```

### Design Tokens

The styles file includes design tokens for consistent colors and fonts:

```typescript
// Colors
colors.primary     // #18181b (dark text, buttons)
colors.secondary   // #666666 (body text)
colors.muted       // #999999 (helper text)
colors.background  // #ffffff (page background)
colors.surface     // #f4f4f5 (code box background)

// Fonts
fonts.base         // system-ui, -apple-system, sans-serif
fonts.mono         // monospace (for OTP codes)
```

### Adding New Styles

Add new styles to the appropriate category in `styles.ts`:

```typescript
// In styles.ts
export const components = {
  // ... existing styles
  newComponent: {
    padding: '16px',
    backgroundColor: colors.surface,
    borderRadius: '8px',
  },
} as const
```

Then import and use in your template:

```tsx
import { components } from '../styles'

<Section style={components.newComponent}>
  {/* content */}
</Section>
```

## Troubleshooting

### "Template not found" in preview

**Cause:** Template not added to registry.

**Fix:** Ensure template is exported from `templates/index.ts` and added to `emailTemplates` object.

### TypeScript error when using renderEmail

**Cause:** Template not added to render utility.

**Fix:** Add template to `EmailTemplateMap` type and ts-pattern match in `render.tsx`.

### Exhaustive error in render.tsx

**Cause:** Template added to `EmailTemplateMap` but not to ts-pattern match.

**Fix:** Add `.with('templateName', () => <Component {...props} />)` case.

### Email looks different in Outlook

**Cause:** Outlook has limited CSS support.

**Fix:** Use inline styles, avoid flexbox/grid, test in Outlook.

## Principles

1. **Use shared components** - EmailLayout and Button ensure consistency
2. **Keep templates simple** - Complex logic belongs in the service layer
3. **Preview before deploying** - Always check `/dev/emails` during development
4. **Export props interface** - Enables type-safe usage across the codebase
5. **Add to registry** - All templates should appear in the dev preview
