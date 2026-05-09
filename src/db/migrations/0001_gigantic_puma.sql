CREATE TABLE "class_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"enrolled_by" integer,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"action" text NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"last_viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"content_id" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"points" integer NOT NULL,
	"time_spent" integer,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer,
	"mode" text NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"score" integer NOT NULL,
	"percentage" integer NOT NULL,
	"time_spent" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_answers" DROP CONSTRAINT "session_answers_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "audio_muted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "subtopic" text;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "approved_by" integer;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD COLUMN "correct_answers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD COLUMN "total_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD COLUMN "period_start" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "session_answers" ADD COLUMN "content_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "session_answers" ADD COLUMN "time_bonus" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_sessions" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_enrolled_by_users_id_fk" FOREIGN KEY ("enrolled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approvals" ADD CONSTRAINT "content_approvals_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approvals" ADD CONSTRAINT "content_approvals_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_answers" ADD CONSTRAINT "session_answers_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_answers" DROP COLUMN "question_id";--> statement-breakpoint
ALTER TABLE "challenge_sessions" ADD CONSTRAINT "challenge_sessions_room_code_unique" UNIQUE("room_code");