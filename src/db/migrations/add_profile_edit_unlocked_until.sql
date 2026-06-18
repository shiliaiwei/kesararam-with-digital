ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "profile_edit_unlocked_until" timestamp;
