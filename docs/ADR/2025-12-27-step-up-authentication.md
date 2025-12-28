# Decision: Step-Up Authentication for Sensitive Operations

**Date:** 2025-12-27
**Status:** Accepted

## Context

Certain operations in this application are high-risk and require additional verification beyond an existing session:

- **Email changes** - Could lock user out of account
- **Account deletion** - Irreversible data loss

The challenge: How to require recent identity verification without forcing users to fully re-authenticate or adding friction to every request.

## Decision

Implement **step-up authentication** using time-bound OTP verification tracked on the session.

### How It Works

1. **Session tracks OTP verification time:**

   ```typescript
   sessions: {
     // ... existing fields
     lastOtpVerifiedAt: timestamp; // When user last completed OTP verification
   }
   ```

2. **Sensitive procedures use middleware:**

   ```typescript
   const sensitiveProcedure = protectedProcedure.use(freshOtpMiddleware);

   export const deleteAccount = sensitiveProcedure.mutation(/* ... */);
   ```

3. **Middleware checks OTP freshness:**

   ```typescript
   // If lastOtpVerifiedAt is null or older than 15 minutes
   if (!session.lastOtpVerifiedAt || isOlderThan(15, "minutes")) {
     throw appError("REQUEST_NEW_OTP");
   }
   ```

4. **Frontend handles redirect globally:**

   ```typescript
   // In QueryClient mutationCache
   if (parsed.appCode === "REQUEST_NEW_OTP") {
     router.navigate({ to: "/otp", search: { redirect: currentPath } });
   }
   ```

5. **After OTP verification:** User is redirected back to complete the action.

### OTP Verification Window

- **Duration:** 15 minutes
- **Rationale:** Long enough to complete multi-step operations, short enough to limit exposure if session is compromised

### Error Code

```typescript
// @finance/shared/errors
'REQUEST_NEW_OTP': 'Please verify your identity to continue.'
```

## Alternatives Considered

### Password Re-entry

- Familiar UX pattern (sudo mode)
- Confirms user knows credentials

**Rejected:** We use passwordless OTP authentication, so users don't have passwords to re-enter.

### Separate Short-Lived Token

- Issue a "sensitive operation token" after OTP
- Token required for sensitive endpoints
- Stored in memory or short-lived cookie

**Rejected:** Adds complexity. Tracking on session is simpler and achieves the same security goal.

### Per-Operation OTP

- Require OTP for every sensitive operation
- No time window

**Rejected:** Poor UX if user wants to change email AND delete account in same session. Time window reduces friction.

### No Step-Up (Trust Session)

- Session alone is sufficient
- Rely on session expiry for security

**Rejected:** Sessions are long-lived (30 days). If session token is stolen, attacker could perform destructive actions. Step-up limits the damage window.

## Consequences

### Positive

- High-risk operations require recent identity proof
- Centralized handling via middleware (easy to add new sensitive operations)
- Global frontend redirect (components don't need custom error handling)
- 15-minute window balances security and UX
- Reuses existing OTP infrastructure

### Negative

- Additional friction for sensitive operations
- Requires email access for verification
- Session table has additional column

### Implementation Notes

- `freshOtpMiddleware` defined in `apps/server/src/trpc/middlewares/freshOtp.ts`
- Global redirect in `apps/web/src/lib/query.ts`
- OTP page at `/otp` with redirect query param
- See `apps/web/src/lib/README.md` for frontend error handling details
