# Feature 01: Database Schema

> **Epic:** [Client Management](epic-client-management.md) > **Status:** Pending
> **Estimated Effort:** M

## Summary

Create the database schema for client management including the realtor-client junction table, onboarding records, document metadata, and shareable profile tokens. All tables follow existing conventions (UUIDs, timestamps, soft deletes).

## Prerequisites

- [ ] None - this is the first feature in the epic

## User Stories

- As a developer, I need database tables to store client relationships so the application can manage realtor-client data
- As a developer, I need proper foreign keys and constraints so data integrity is maintained

## Acceptance Criteria

- [ ] AC1: `realtor_clients` table exists with correct schema and constraints
- [ ] AC2: `client_onboarding` table exists with all personal info fields
- [ ] AC3: `client_documents` table exists for document metadata storage
- [ ] AC4: `shareable_profile_tokens` table exists with token and expiration fields
- [ ] AC5: All foreign keys reference `users` table correctly with proper cascade rules
- [ ] AC6: Migration file is generated and applies successfully
- [ ] AC7: Types are exported from schema barrel file

## Technical Specification

### Data Model Changes

Create new file `apps/server/src/db/schema/clients.ts`:

```typescript
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";

// Enums
export const clientStatusEnum = pgEnum("client_status", ["pending", "active"]);

// Junction table for realtor-client relationships
export const realtorClients = pgTable("realtor_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  realtorId: uuid("realtor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: clientStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type RealtorClient = typeof realtorClients.$inferSelect;
export type NewRealtorClient = typeof realtorClients.$inferInsert;

// Onboarding data - one record per realtor-client pair
export const clientOnboarding = pgTable("client_onboarding", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  realtorId: uuid("realtor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Personal Information
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  currentAddress: text("current_address"),
  currentCity: text("current_city"),
  currentProvince: text("current_province"),
  currentPostalCode: text("current_postal_code"),

  // Employment Information
  employerName: text("employer_name"),
  employerPhone: text("employer_phone"),
  jobTitle: text("job_title"),
  monthlyIncome: integer("monthly_income"), // Stored in whole dollars
  employmentStartDate: timestamp("employment_start_date", {
    withTimezone: true,
  }),

  // Emergency Contact
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelationship: text("emergency_contact_relationship"),

  // Additional Info
  numberOfOccupants: integer("number_of_occupants"),
  hasPets: text("has_pets"), // 'yes', 'no', or description
  additionalNotes: text("additional_notes"),

  // Timestamps
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ClientOnboarding = typeof clientOnboarding.$inferSelect;
export type NewClientOnboarding = typeof clientOnboarding.$inferInsert;

// Document metadata (files stored in S3/MinIO)
export const clientDocuments = pgTable("client_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  onboardingId: uuid("onboarding_id")
    .notNull()
    .references(() => clientOnboarding.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  s3Key: text("s3_key").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type NewClientDocument = typeof clientDocuments.$inferInsert;

// Shareable profile tokens for landlords
export const shareableProfileTokens = pgTable("shareable_profile_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  realtorId: uuid("realtor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ShareableProfileToken = typeof shareableProfileTokens.$inferSelect;
export type NewShareableProfileToken =
  typeof shareableProfileTokens.$inferInsert;
```

### Schema Index Update

Update `apps/server/src/db/schema/index.ts`:

```typescript
export * from "./auth";
export * from "./clients";
```

### API Changes

None - this feature only creates database schema.

### UI Components

None - this feature only creates database schema.

### Business Logic

None - this feature only creates database schema.

## Edge Cases & Error Handling

| Scenario                               | Expected Behavior                                        |
| -------------------------------------- | -------------------------------------------------------- |
| Duplicate realtor-client pair          | Enforce via unique constraint on (realtor_id, client_id) |
| Client deleted while onboarding exists | Cascade delete via foreign key                           |
| Document references deleted onboarding | Cascade delete via foreign key                           |

## Testing Requirements

- [ ] Unit test: Schema types compile correctly
- [ ] Integration test: Migration applies without errors
- [ ] Integration test: Can insert/select from all tables
- [ ] Integration test: Foreign key constraints work correctly
- [ ] Integration test: Cascade deletes work correctly

## Implementation Notes

1. **Generate migration after schema creation:**

   ```bash
   pnpm --filter @app/server db:generate
   pnpm --filter @app/server db:migrate
   ```

2. **Follow existing auth.ts patterns** for type exports and column naming

3. **Use `integer` for money** - The `monthlyIncome` field stores whole dollars (e.g., 5000 = $5,000)

4. **Enum naming convention** - Drizzle enums use snake_case for PostgreSQL compatibility

5. **Add unique constraint** for realtor-client pair to prevent duplicates. You may need to add this in a separate migration or via Drizzle's `.unique()` method:
   ```typescript
   // Add to realtorClients table or create separate unique index
   ```

## Files to Create/Modify

| File                                   | Action | Description                     |
| -------------------------------------- | ------ | ------------------------------- |
| `apps/server/src/db/schema/clients.ts` | Create | New schema file with all tables |
| `apps/server/src/db/schema/index.ts`   | Modify | Add export for clients schema   |
| `apps/server/drizzle/XXXX_*.sql`       | Create | Generated migration file        |

## Out of Scope

- tRPC procedures (Feature 03+)
- File upload logic (Feature 02)
- UI components (Feature 03+)
- Seeding test data
