import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Enums
export const clientStatusEnum = pgEnum('client_status', ['invited', 'active', 'inactive'])

// Junction table for realtor-client relationships
// Note: Unique constraint on (realtor_id, client_id) WHERE deleted_at IS NULL
// is managed via partial index in migration 0007, not in Drizzle schema
export const realtorClients = pgTable('realtor_clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  realtorId: uuid('realtor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: clientStatusEnum('status').notNull().default('invited'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export type RealtorClient = typeof realtorClients.$inferSelect
export type NewRealtorClient = typeof realtorClients.$inferInsert
