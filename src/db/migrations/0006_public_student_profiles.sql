-- Public student profiles are the KWD default. School names remain private;
-- classroom name and province may be independently hidden by each student.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "is_class_public" boolean NOT NULL DEFAULT true;

ALTER TABLE "users"
  ALTER COLUMN "is_profile_public" SET DEFAULT true,
  ALTER COLUMN "is_name_public" SET DEFAULT true,
  ALTER COLUMN "is_username_public" SET DEFAULT true,
  ALTER COLUMN "is_school_public" SET DEFAULT false,
  ALTER COLUMN "is_province_public" SET DEFAULT true,
  ALTER COLUMN "is_grade_public" SET DEFAULT true,
  ALTER COLUMN "is_section_public" SET DEFAULT true,
  ALTER COLUMN "is_stats_public" SET DEFAULT true;

UPDATE "users"
SET "is_profile_public" = true,
    "is_name_public" = true,
    "is_username_public" = true,
    "is_school_public" = false,
    "is_province_public" = true,
    "is_class_public" = true,
    "is_grade_public" = true,
    "is_section_public" = true,
    "is_stats_public" = true
WHERE "role" = 'student';
