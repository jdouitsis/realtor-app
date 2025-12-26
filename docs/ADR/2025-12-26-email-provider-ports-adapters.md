# Decision: Use Resend with Ports/Adapters Architecture for Email

**Date:** 2025-12-26
**Status:** Accepted

## Context

The application needs to send transactional emails (OTP codes for authentication). We need an email provider that is reliable, developer-friendly, and allows for future flexibility to switch providers.

## Decision

Use **Resend** as the email provider, implemented using a **ports and adapters** (hexagonal) architecture pattern.

**Directory Structure:**

```
apps/server/src/infra/email/
├── types.ts          # EmailService interface (port)
├── index.ts          # Exports the active adapter
└── resend/
    └── index.ts      # Resend implementation (adapter)
```

**Interface:**

```typescript
interface EmailService {
  send(options: SendEmailOptions): Promise<SendEmailResult>
}
```

Swapping providers requires only:

1. Create new adapter (e.g., `infra/email/mailgun/index.ts`)
2. Change the export in `infra/email/index.ts`

## Alternatives Considered

### Mailgun

- Better deliverability reputation (established player)
- More complex API, steeper learning curve
- Free tier: 5,000 emails/month for 3 months

**Rejected:** Resend's DX is significantly better for rapid development. Can migrate later if deliverability becomes an issue.

### Direct SMTP (Nodemailer)

- Works with any SMTP provider
- More configuration required
- Lower-level abstraction

**Rejected:** More setup overhead. Modern API services provide better observability and deliverability.

### No abstraction (direct Resend SDK)

- Simpler initial implementation
- Less code

**Rejected:** Coupling to a specific provider makes future migrations expensive. The abstraction cost is minimal.

## Consequences

### Positive

- Provider-agnostic application code
- Easy to test (mock the interface)
- Future migration requires only a new adapter

### Negative

- Slight indirection cost
- Must maintain interface compatibility
