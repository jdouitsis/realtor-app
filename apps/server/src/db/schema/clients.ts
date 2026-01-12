import { integer, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

import { users } from './auth'

// Enums
export const clientStatusEnum = pgEnum('client_status', ['pending', 'active'])

export const documentTypeEnum = pgEnum('document_type', [
  'credit_score',
  'photo_id',
  'paystub_1',
  'paystub_2',
  'job_letter',
])

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

// Onboarding data - one record per realtor-client pair
export const clientOnboarding = pgTable('client_onboarding', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  realtorId: uuid('realtor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Personal Information
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  currentAddress: text('current_address'),
  currentCity: text('current_city'),
  currentProvince: text('current_province'),
  currentPostalCode: text('current_postal_code'),

  // Employment Information
  employerName: text('employer_name'),
  employerPhone: text('employer_phone'),
  jobTitle: text('job_title'),
  monthlyIncome: integer('monthly_income'), // Stored in whole dollars
  employmentStartDate: timestamp('employment_start_date', { withTimezone: true }),

  // Emergency Contact
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelationship: text('emergency_contact_relationship'),

  // Additional Info
  numberOfOccupants: integer('number_of_occupants'),
  hasPets: text('has_pets'), // 'yes', 'no', or description
  additionalNotes: text('additional_notes'),

  // Timestamps
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ClientOnboarding = typeof clientOnboarding.$inferSelect
export type NewClientOnboarding = typeof clientOnboarding.$inferInsert

// Document metadata (files stored in S3/MinIO)
export const clientDocuments = pgTable('client_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  onboardingId: uuid('onboarding_id')
    .notNull()
    .references(() => clientOnboarding.id, { onDelete: 'cascade' }),
  type: documentTypeEnum('type').notNull(),
  title: text('title').notNull(),
  s3Key: text('s3_key').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ClientDocument = typeof clientDocuments.$inferSelect
export type NewClientDocument = typeof clientDocuments.$inferInsert

// Shareable profile tokens for landlords
export const shareableProfileTokens = pgTable('shareable_profile_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  realtorId: uuid('realtor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ShareableProfileToken = typeof shareableProfileTokens.$inferSelect
export type NewShareableProfileToken = typeof shareableProfileTokens.$inferInsert
