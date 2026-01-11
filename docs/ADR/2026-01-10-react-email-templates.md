# Decision: Use React Email for Email Templates

**Date:** 2026-01-10
**Status:** Accepted

## Context

Email templates were previously inline HTML strings scattered across service files. This made templates hard to maintain, preview, and test. We needed a solution that provides:

- Type-safe email templates
- Live preview during development
- Component reusability
- Consistent styling across emails

## Decision

Use **React Email** for email templates with **ts-pattern** for type-safe rendering.

**Directory Structure:**

```
apps/server/src/infra/email/
├── templates/
│   ├── components/
│   │   ├── EmailLayout.tsx    # Shared layout wrapper
│   │   └── Button.tsx         # Reusable CTA button
│   ├── OtpEmail.tsx           # OTP verification template
│   ├── MagicLinkEmail.tsx     # Magic link template
│   └── index.ts               # Template registry
├── render.tsx                 # Type-safe render utility
├── types.ts                   # EmailService interface
└── resend/                    # Provider adapter
```

**Render API:**

```typescript
import { renderEmail } from '@server/infra/email/render'

const { html, text } = await renderEmail({
  type: 'otp',
  code: '123456',
  expiresInMinutes: 15,
})
```

The API uses a discriminated union with a `type` field (see [SOP: Discriminated Unions](../SOP/sop-discriminated-unions.md)). TypeScript infers the correct props based on the template type, and ts-pattern provides exhaustive matching.

**Dev Preview:**

Templates are previewable at `http://localhost:3001/dev/emails` during development. The server logs this URL on startup.

## Alternatives Considered

### MJML

- Email-specific markup language
- Better email client compatibility
- Different paradigm from React

**Rejected:** Learning curve for a new templating language. React Email provides similar benefits with familiar React patterns.

### Handlebars Templates

- Popular templating engine
- Separates logic from templates

**Rejected:** No type safety for template variables. Runtime errors instead of compile-time errors.

### Keep Inline HTML

- No dependencies
- Simple to understand

**Rejected:** Poor developer experience. Templates scattered across files. No preview capability.

## Consequences

### Positive

- Type-safe templates with compile-time prop validation
- Live preview at `/dev/emails` during development
- Reusable components (EmailLayout, Button)
- Familiar React patterns
- ts-pattern ensures exhaustive template matching

### Negative

- Adds React dependency to server
- Requires JSX enabled in tsconfig
- Templates render asynchronously
