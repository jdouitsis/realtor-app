# Epic: Client Management

> **Status:** Planning
> **Created:** 2026-01-15
> **Last Updated:** 2026-01-15

## Overview

This epic introduces the ability for realtors to manage their client relationships within the application. Realtors can invite clients via email, view a list of all their clients with status filters, and access individual client profiles.

The core workflow is: a realtor invites a client by entering their email and name. If the client doesn't exist in the system, a user account is created for them. A magic link email is sent to the client, and when they click it, they're redirected to the `/forms` page and their status becomes "active". Realtors can filter their client list by status and manually mark clients as inactive when deals conclude.

## Goals

- [ ] Realtors can invite clients by email (creates user if needed, sends magic link)
- [ ] Realtors can view a filterable list of their clients
- [ ] Realtors can view individual client profiles
- [ ] Realtors can change client status (active ↔ inactive)
- [ ] Clients clicking magic links are activated and redirected to `/forms`

## Non-Goals

- Client-facing dashboard or client-initiated actions (future epic)
- Property/deal association with clients (future epic)
- Bulk invite functionality
- Client notes or activity history
- Email notifications beyond the initial magic link invite

## Technical Context

### Existing Infrastructure

- **`realtorClients` junction table** - Links realtors to clients with status
- **`users` table** - Has `isRealtor` boolean to distinguish user types
- **`magicLinkService`** - Handles token generation, validation, and consumption
- **Domain-driven architecture** - `domains/{name}/procedures/`, `services/`, `router.ts`

### Key Design Decisions

1. **Single mutation for invite** - `clients.invite` handles both user creation (if needed) and relationship creation, delegating user creation to a helper service
2. **Status on junction table** - Status (`invited | active | inactive`) lives on `realtorClients`, not `users`, since a user can have different statuses with different realtors
3. **Magic link activation** - When a client consumes their magic link, the `realtorClients.status` updates from `invited` → `active`
4. **Duplicate handling** - If a realtor invites an existing client, return an error with the client ID so the UI can navigate to their profile

### Schema Changes

```sql
-- Rename enum value and add new status
ALTER TYPE client_status RENAME VALUE 'pending' TO 'invited';
ALTER TYPE client_status ADD VALUE 'inactive';
```

### API Shape (tRPC)

```typescript
clients.list; // Query: { status?: 'invited' | 'active' | 'inactive' } → Client[]
clients.getById; // Query: { id: string } → Client
clients.invite; // Mutation: { email: string, name: string } → { clientId: string } | Error
clients.updateStatus; // Mutation: { clientId: string, status: 'active' | 'inactive' } → void
```

## Feature Tracker

| #   | Feature                | Status   | File                         |
| --- | ---------------------- | -------- | ---------------------------- |
| 01  | Schema Migration       | Complete | `feature-01-schema.md`       |
| 02  | Clients Domain Backend | Complete | `feature-02-backend.md`      |
| 03  | Clients List Page      | Complete | `feature-03-list-page.md`    |
| 04  | Client Profile Page    | Pending  | `feature-04-profile-page.md` |
| 05  | Invite Client Flow     | Pending  | `feature-05-invite-flow.md`  |

### Feature Dependencies

```
                            ┌─────────────────────────┐
                            │  01. Schema Migration   │
                            └───────────┬─────────────┘
                                        │
                                        ▼
                            ┌─────────────────────────┐
                            │  02. Clients Domain     │
                            │      Backend            │
                            └───────────┬─────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│  03. Clients List Page  │ │  04. Client Profile     │ │  05. Invite Client      │
│                         │ │      Page               │ │      Flow               │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

**Recommended Implementation Order:** 01 → 02 → 03 → 04 → 05

> **Note:** Features 03, 04, and 05 can be parallelized after Feature 02 is complete. They all depend on the backend but not on each other.

**Status Legend:**

- **Pending** - Not yet started
- **In Progress** - Currently being implemented
- **In Review** - Implementation complete, awaiting review
- **Complete** - Merged and deployed
- **Blocked** - Cannot proceed (see notes)

## Instructions for Engineers

1. **Before starting a feature:** Update its status to "In Progress" in the tracker above
2. **After completing a feature:** Update its status to "Complete" and check off related goals
3. **If blocked:** Update status to "Blocked" and add a note in the feature file explaining why
4. **Features must be completed in order** unless explicitly noted otherwise
5. **Each feature file is self-contained** - read it thoroughly before implementation

## Open Questions

_None - all requirements clarified during planning._

## Revision History

| Date       | Author | Changes          |
| ---------- | ------ | ---------------- |
| 2026-01-15 | Claude | Initial planning |
