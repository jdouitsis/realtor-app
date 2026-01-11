# Decision: Magic Link Authentication

**Date:** 2025-01-10
**Status:** Accepted

## Context

The application supports OTP-based authentication where users enter their email, receive a 6-digit code, and verify it to log in. While this works well for most cases, there are scenarios where a direct login link is preferable:

1. **Admin-generated links:** Invite new users or re-engage inactive users with a single-click login link
2. **Passwordless login:** Users can request a magic link instead of entering an OTP code
3. **Deep linking:** Send users directly to a specific page after authentication (e.g., `/events/123`)

## Decision

Implement **magic link authentication** alongside the existing OTP flow:

- **Single-use tokens:** 256-bit random tokens consumed on first use
- **Configurable expiration:** Default 24 hours, up to 7 days for admin-generated links
- **Redirect support:** Links can include a redirect URL (e.g., `/login/magic?token=abc&redirect=/events`)
- **Two flows:** User-initiated (sends email) and admin-generated (returns URL directly)

### URL Format

```
{WEB_URL}/login/magic?token={64-char-hex}&redirect={encodedUrl}
```

### Database Schema

```typescript
magicLinks: {
  id: uuid (primary key)
  userId: uuid (foreign key → users)
  token: text (unique, indexed)
  expiresAt: timestamp
  usedAt: timestamp (null until consumed)
  createdAt: timestamp
  createdBy: uuid (null = user-initiated, set = admin-generated)
  redirectUrl: text
  ipAddress: text
}
```

### API Procedures

| Procedure                | Type      | Purpose                                       |
| ------------------------ | --------- | --------------------------------------------- |
| `auth.requestMagicLink`  | Public    | User enters email, sends magic link via email |
| `auth.generateMagicLink` | Protected | Admin generates link, returns URL directly    |
| `auth.verifyMagicLink`   | Public    | Validates token, creates 30-day session       |

## Alternatives Considered

### 1. Extend OTP codes to support magic links

Reuse the `otp_codes` table with a flag indicating whether it's a 6-digit code or magic link token.

**Rejected:** OTP codes have different semantics (attempt tracking, shorter expiry). Separate table is cleaner.

### 2. JWT-based magic links

Encode user ID and expiration in a signed JWT token.

**Rejected:** Cannot revoke individual tokens. Database-backed tokens allow invalidation and audit trail.

### 3. Time-based tokens (TOTP-style)

Generate tokens based on time windows.

**Rejected:** Adds complexity, doesn't support configurable expiration per link.

## Consequences

### Positive

- Single-click authentication for users
- Admin can generate invite/re-engagement links
- Deep linking to specific pages after auth
- Audit trail (who created the link, when used)
- Consistent with existing session-based auth

### Negative

- Additional database table and migrations
- Email deliverability affects usability
- Links can be intercepted (same risk as OTP emails)

### Security Considerations

- **Token entropy:** 256-bit random tokens (same as session tokens)
- **Single-use:** Token marked as used immediately after successful verification
- **Rate limiting:** Same limits as OTP requests (3/5min for request, 5/min for verify)
- **Email enumeration protection:** Same response regardless of email existence
- **Redirect validation:** Only relative URLs or same-origin allowed

## Related Files

### Server

| File                                                           | Purpose               |
| -------------------------------------------------------------- | --------------------- |
| `apps/server/src/db/schema/auth.ts`                            | `magicLinks` table    |
| `apps/server/src/domains/auth/services/magicLink.ts`           | Token CRUD operations |
| `apps/server/src/domains/auth/procedures/requestMagicLink.ts`  | User-initiated flow   |
| `apps/server/src/domains/auth/procedures/generateMagicLink.ts` | Admin flow            |
| `apps/server/src/domains/auth/procedures/verifyMagicLink.ts`   | Token verification    |

### Web

| File                                                       | Purpose              |
| ---------------------------------------------------------- | -------------------- |
| `apps/web/src/routes/_public/login.magic.tsx`              | Route definition     |
| `apps/web/src/features/auth/pages/MagicLinkPage/index.tsx` | Verification UI      |
| `apps/web/src/lib/auth.ts`                                 | `requestMagicLink()` |
