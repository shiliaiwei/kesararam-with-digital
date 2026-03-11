import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  titleEn: text("title_en").notNull(),
  titleKm: text("title_km"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  type: text("type").notNull(),
  titleEn: text("title_en").notNull(),
  titleKm: text("title_km").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKm: text("description_km").notNull().default(""),
  imageUrl: text("image_url"),
  audioUrlEn: text("audio_url_en"),
  audioUrlKm: text("audio_url_km"),
  questionEn: text("question_en").notNull().default(""),
  questionKm: text("question_km").notNull().default(""),
  answerEn: text("answer_en").notNull().default(""),
  answerKm: text("answer_km").notNull().default(""),
  scorePoints: integer("score_points").default(10).notNull(),
  timeLimit: integer("time_limit").default(30).notNull(),
  difficulty: text("difficulty"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
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
  frontKm: text("front_km").notNull().default(""),
  backEn: text("back_en").notNull(),
  backKm: text("back_km").notNull().default(""),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
