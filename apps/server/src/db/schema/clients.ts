import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Enums
export const clientStatusEnum = pgEnum('client_status', ['pending', 'active'])

// Junction table for realtor-client relationships
export const realtorClients = pgTable(
  'realtor_clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    realtorId: uuid('realtor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: clientStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [unique().on(table.realtorId, table.clientId)]
)

export type RealtorClient = typeof realtorClients.$inferSelect
export type NewRealtorClient = typeof realtorClients.$inferInsert
