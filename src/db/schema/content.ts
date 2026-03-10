import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const categorySlugEnum = pgEnum("category_slug", [
  "road-sign",
  "road-traffic",
  "priority",
  "driving",
  "technical",
  "loading-people-goods",
  "general-knowledge",
  "emergency",
]);

export const contentTypeEnum = pgEnum("content_type", [
  "sign", // traffic sign with image
  "qa", // question & answer
  "scenario", // scenario with image
  "reference", // reference / law article
  "contact", // emergency contact
]);

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  categorySlug: categorySlugEnum("category_slug").notNull(),
  type: contentTypeEnum("type").notNull().default("qa"),
  titleEn: text("title_en").notNull(),
  titleKh: text("title_kh").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKh: text("description_kh").notNull().default(""),
  questionEn: text("question_en").notNull().default(""),
  questionKh: text("question_kh").notNull().default(""),
  answerEn: text("answer_en").notNull().default(""),
  answerKh: text("answer_kh").notNull().default(""),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  score: integer("score").default(10).notNull(),
  points: integer("points").default(1).notNull(),
  timeLimitSeconds: integer("time_limit_seconds").default(30).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  frontEn: text("front_en").notNull(),
  frontKh: text("front_kh").notNull().default(""),
  backEn: text("back_en").notNull(),
  backKh: text("back_kh").notNull().default(""),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
