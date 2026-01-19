# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions made in this project.

## Decisions

| Date       | Decision                                                               | Summary                                                                      |
| ---------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 2026-01-18 | [Linear Design System](./2026-01-18-linear-design-system.md)           | Linear-inspired design system with custom colors, typography, and components |
| 2026-01-16 | [Route Not Found Handling](./2026-01-16-route-not-found-handling.md)   | Use `notFound()` in loaders with `defaultNotFoundComponent` on router        |
| 2026-01-10 | [React Email Templates](./2026-01-10-react-email-templates.md)         | Use React Email for type-safe, previewable email templates                   |
| 2025-01-10 | [Magic Link Auth](./2025-01-10-magic-link-auth.md)                     | Single-use magic links for passwordless login and admin-generated invites    |
| 2025-12-28 | [Router-Based Auth](./2025-12-28-router-based-auth.md)                 | Auth via router context + factory pattern, replaces React Context            |
| 2025-12-28 | [Authorization Header Auth](./2025-12-28-authorization-header-auth.md) | Use Authorization header + localStorage instead of cookies (Safari fix)      |
| 2025-12-27 | [Step-Up Authentication](./2025-12-27-step-up-authentication.md)       | Require recent OTP verification for sensitive operations (email, delete)     |
| 2025-12-26 | [Server Path Alias](./2025-12-26-server-path-alias.md)                 | Use `@server/*` instead of `@/*` in server to avoid cross-package conflicts  |
| 2025-12-26 | [Email Provider](./2025-12-26-email-provider-ports-adapters.md)        | Use Resend with ports/adapters pattern for swappable email infrastructure    |
| 2025-12-26 | [Database Sessions](./2025-12-26-database-sessions.md)                 | Use database-backed sessions for authentication (token transport superseded) |
| 2025-12-26 | [Rate Limiting](./2025-12-26-rate-limiting.md)                         | IP-based rate limiting on auth endpoints using tRPC middleware               |

## Format

Each decision document follows this structure:

- **Context:** Why the decision was needed
- **Decision:** What was decided
- **Alternatives Considered:** Other options that were evaluated
- **Consequences:** Trade-offs and implications of the decision
