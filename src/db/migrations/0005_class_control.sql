-- Class control migration
-- Adds school/province/grade metadata and single-class assignment support

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "school_name" text,
  ADD COLUMN IF NOT EXISTS "province" text,
  ADD COLUMN IF NOT EXISTS "grade_level" text,
  ADD COLUMN IF NOT EXISTS "section" text,
  ADD COLUMN IF NOT EXISTS "class_id" integer;

DO $$
BEGIN
  ALTER TABLE "users"
    ADD CONSTRAINT "users_class_id_classes_id_fk"
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "classes"
  ADD COLUMN IF NOT EXISTS "school_name" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "province" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "grade_level" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "section" text,
  ADD COLUMN IF NOT EXISTS "is_locked" boolean NOT NULL DEFAULT false;

ALTER TABLE "classes"
  ALTER COLUMN "school_name" DROP DEFAULT,
  ALTER COLUMN "province" DROP DEFAULT,
  ALTER COLUMN "grade_level" DROP DEFAULT;

ALTER TABLE "class_enrollments"
  ALTER COLUMN "student_id" SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE "class_enrollments"
    ADD CONSTRAINT "class_enrollments_class_student_unique"
    UNIQUE ("class_id", "student_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "users_class_id_idx" ON "users"("class_id");
CREATE INDEX IF NOT EXISTS "classes_school_name_idx" ON "classes"("school_name");
CREATE INDEX IF NOT EXISTS "classes_province_idx" ON "classes"("province");
CREATE INDEX IF NOT EXISTS "classes_grade_level_idx" ON "classes"("grade_level");
