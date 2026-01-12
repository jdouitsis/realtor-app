CREATE TYPE "public"."client_status" AS ENUM('pending', 'active');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('credit_score', 'photo_id', 'paystub_1', 'paystub_2', 'job_letter');--> statement-breakpoint
CREATE TABLE "client_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"onboarding_id" uuid NOT NULL,
	"type" "document_type" NOT NULL,
	"title" text NOT NULL,
	"s3_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"realtor_id" uuid NOT NULL,
	"phone" text,
	"date_of_birth" timestamp with time zone,
	"current_address" text,
	"current_city" text,
	"current_province" text,
	"current_postal_code" text,
	"employer_name" text,
	"employer_phone" text,
	"job_title" text,
	"monthly_income" integer,
	"employment_start_date" timestamp with time zone,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relationship" text,
	"number_of_occupants" integer,
	"has_pets" text,
	"additional_notes" text,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "realtor_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"realtor_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"status" "client_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "shareable_profile_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"realtor_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shareable_profile_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_onboarding_id_client_onboarding_id_fk" FOREIGN KEY ("onboarding_id") REFERENCES "public"."client_onboarding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_onboarding" ADD CONSTRAINT "client_onboarding_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_onboarding" ADD CONSTRAINT "client_onboarding_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realtor_clients" ADD CONSTRAINT "realtor_clients_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realtor_clients" ADD CONSTRAINT "realtor_clients_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shareable_profile_tokens" ADD CONSTRAINT "shareable_profile_tokens_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shareable_profile_tokens" ADD CONSTRAINT "shareable_profile_tokens_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;