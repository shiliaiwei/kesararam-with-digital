-- Add optional class scoping to live game sessions.
-- When set, only students enrolled in this class may join the session.
ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "class_id" integer;

DO $$ BEGIN
  ALTER TABLE "game_sessions"
    ADD CONSTRAINT "game_sessions_class_id_classes_id_fk"
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Track how many times a class name has been changed (limit enforced in app).
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "name_changed_count" integer DEFAULT 0 NOT NULL;
