CREATE TYPE "public"."user_role" AS ENUM('DEFAULT', 'ADMIN');--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"external_id" text NOT NULL,
	"pix_qr_code" text NOT NULL,
	"pix_text" text NOT NULL,
	"paid_at" timestamp (3) with time zone,
	"expires_at" timestamp (3) with time zone,
	CONSTRAINT "payment_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"plan" "plan" DEFAULT 'FREE' NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'DEFAULT' NOT NULL,
	"password" text NOT NULL,
	"oauth2provider" text,
	"emailVerified" boolean DEFAULT false,
	"twoFactorAuthenticationEnabled" boolean DEFAULT false,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops);