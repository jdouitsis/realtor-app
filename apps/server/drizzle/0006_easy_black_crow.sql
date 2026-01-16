-- Step 1: Convert column to text temporarily
ALTER TABLE "realtor_clients" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint

-- Step 2: Update existing 'pending' values to 'invited'
UPDATE "realtor_clients" SET "status" = 'invited' WHERE "status" = 'pending';--> statement-breakpoint

-- Step 3: Set temporary default
ALTER TABLE "realtor_clients" ALTER COLUMN "status" SET DEFAULT 'invited'::text;--> statement-breakpoint

-- Step 4: Drop old enum
DROP TYPE "public"."client_status";--> statement-breakpoint

-- Step 5: Create new enum with updated values
CREATE TYPE "public"."client_status" AS ENUM('invited', 'active', 'inactive');--> statement-breakpoint

-- Step 6: Set proper default with new enum
ALTER TABLE "realtor_clients" ALTER COLUMN "status" SET DEFAULT 'invited'::"public"."client_status";--> statement-breakpoint

-- Step 7: Convert column back to enum
ALTER TABLE "realtor_clients" ALTER COLUMN "status" SET DATA TYPE "public"."client_status" USING "status"::"public"."client_status";
