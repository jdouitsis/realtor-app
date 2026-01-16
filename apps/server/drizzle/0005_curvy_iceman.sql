CREATE TYPE "public"."client_status" AS ENUM('pending', 'active');--> statement-breakpoint
CREATE TABLE "realtor_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"realtor_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"status" "client_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "realtor_clients_realtor_id_client_id_unique" UNIQUE("realtor_id","client_id")
);
--> statement-breakpoint
ALTER TABLE "realtor_clients" ADD CONSTRAINT "realtor_clients_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realtor_clients" ADD CONSTRAINT "realtor_clients_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;