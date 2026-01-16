-- Replace simple unique constraint with partial unique index
-- This allows re-inviting a client after soft-deleting the relationship

-- Step 1: Drop the existing unique constraint
ALTER TABLE "realtor_clients" DROP CONSTRAINT "realtor_clients_realtor_id_client_id_unique";--> statement-breakpoint

-- Step 2: Create partial unique index that only applies to non-deleted rows
CREATE UNIQUE INDEX "realtor_clients_realtor_id_client_id_unique"
ON "realtor_clients" ("realtor_id", "client_id")
WHERE "deleted_at" IS NULL;
