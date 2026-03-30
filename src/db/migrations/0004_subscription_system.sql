-- Subscription system migration
-- Only admins can assign subscriptions (enforced at API layer)

CREATE TYPE "plan_tier" AS ENUM ('free', 'teacher_pro', 'school');
CREATE TYPE "subscription_status" AS ENUM ('active', 'expired', 'cancelled', 'trial');

CREATE TABLE "subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "plan" "plan_tier" NOT NULL DEFAULT 'free',
  "status" "subscription_status" NOT NULL DEFAULT 'active',
  "is_trial" boolean NOT NULL DEFAULT false,
  "trial_ends_at" timestamp,
  "starts_at" timestamp NOT NULL DEFAULT now(),
  "ends_at" timestamp,
  "assigned_by" integer NOT NULL REFERENCES "users"("id"),
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
