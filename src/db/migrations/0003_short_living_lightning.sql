CREATE TABLE "admin_review_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"content_id" integer NOT NULL,
	"action" text NOT NULL,
	"review_time" integer,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"answer_type" text NOT NULL,
	"answer_en" text NOT NULL,
	"answer_km" text DEFAULT '' NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"image_source" text DEFAULT 'url',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer,
	"display_name" text NOT NULL,
	"score" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"usage_type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_challenge_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_date" text NOT NULL,
	"question_ids" integer[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_challenge_sets_challenge_date_unique" UNIQUE("challenge_date")
);
--> statement-breakpoint
CREATE TABLE "game_mode_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"game_mode" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"difficulty_override" text,
	"points_override" integer,
	"time_limit_override" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_modes" (
	"id" serial PRIMARY KEY NOT NULL,
	"mode_key" text NOT NULL,
	"name_en" text NOT NULL,
	"name_km" text NOT NULL,
	"description_en" text,
	"description_km" text,
	"tag_label" text,
	"question_count" integer DEFAULT 10,
	"time_limit" integer,
	"timer_per_question" boolean DEFAULT false,
	"categories_included" text[],
	"difficulty_levels" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_modes_mode_key_unique" UNIQUE("mode_key")
);
--> statement-breakpoint
CREATE TABLE "game_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"game_mode" text NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"time_taken" integer,
	"difficulty" text,
	"category_breakdown" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_mode_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer,
	"category_id" integer,
	"mode_type" text NOT NULL,
	"settings" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"source" text DEFAULT 'cloudinary' NOT NULL,
	"cloudinary_id" text,
	"file_size" integer,
	"mime_type" text,
	"width" integer,
	"height" integer,
	"duration" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer,
	"content_id" integer,
	"question_en" text NOT NULL,
	"question_km" text DEFAULT '' NOT NULL,
	"hint_en" text,
	"hint_km" text,
	"image_url" text,
	"image_source" text DEFAULT 'url',
	"audio_url_en" text,
	"audio_source_en" text DEFAULT 'url',
	"audio_url_km" text,
	"audio_source_km" text DEFAULT 'url',
	"difficulty" text DEFAULT 'medium',
	"status" text DEFAULT 'draft',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_activity_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"content_id" integer,
	"category_id" integer,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_category_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"assigned_by" integer,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_code" text NOT NULL,
	"category_id" integer NOT NULL,
	"name_en" text NOT NULL,
	"name_km" text NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_km" text DEFAULT '' NOT NULL,
	"primary_image_url" text,
	"primary_image_source" text DEFAULT 'url',
	"law_reference" text,
	"sub_group" text,
	"audio_url_en" text,
	"audio_source_en" text DEFAULT 'url',
	"audio_url_km" text,
	"audio_source_km" text DEFAULT 'url',
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"submitted_at" timestamp,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topics_topic_code_unique" UNIQUE("topic_code")
);
--> statement-breakpoint
CREATE TABLE "traffic_sign_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"sign_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"action" text NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_signs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"title_km" text NOT NULL,
	"description_en" text NOT NULL,
	"description_km" text NOT NULL,
	"image_url" text NOT NULL,
	"audio_url_en" text,
	"audio_url_km" text,
	"sign_type" text NOT NULL,
	"category" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" integer,
	"approved_by" integer,
	"approved_at" timestamp,
	"rejection_reason" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_play_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "image_source" text DEFAULT 'url';--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "audio_source_en" text DEFAULT 'url';--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "audio_source_km" text DEFAULT 'url';--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "hint_en" text;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "hint_km" text;--> statement-breakpoint
ALTER TABLE "admin_review_metrics" ADD CONSTRAINT "admin_review_metrics_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_review_metrics" ADD CONSTRAINT "admin_review_metrics_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_session_id_challenge_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."challenge_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_media_id_media_resources_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_mode_content" ADD CONSTRAINT "game_mode_content_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_scores" ADD CONSTRAINT "game_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_mode_settings" ADD CONSTRAINT "learning_mode_settings_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_mode_settings" ADD CONSTRAINT "learning_mode_settings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_resources" ADD CONSTRAINT "media_resources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_activity_metrics" ADD CONSTRAINT "staff_activity_metrics_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_activity_metrics" ADD CONSTRAINT "staff_activity_metrics_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_category_assignments" ADD CONSTRAINT "staff_category_assignments_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_category_assignments" ADD CONSTRAINT "staff_category_assignments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_category_assignments" ADD CONSTRAINT "staff_category_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_sign_approvals" ADD CONSTRAINT "traffic_sign_approvals_sign_id_traffic_signs_id_fk" FOREIGN KEY ("sign_id") REFERENCES "public"."traffic_signs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_sign_approvals" ADD CONSTRAINT "traffic_sign_approvals_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_signs" ADD CONSTRAINT "traffic_signs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_signs" ADD CONSTRAINT "traffic_signs_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;