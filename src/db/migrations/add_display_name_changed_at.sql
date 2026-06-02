-- Add display_name_changed_at column for 6-month display name cooldown
ALTER TABLE users
ADD COLUMN IF NOT EXISTS display_name_changed_at TIMESTAMP;
