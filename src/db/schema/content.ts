import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  unique,
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
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'rejected', 'inactive'
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
  subtopic: text("subtopic"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
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

export const contentApprovals = pgTable("content_approvals", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // 'approved', 'rejected'
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    contentId: integer("content_id")
      .notNull()
      .references(() => contentItems.id),
    completed: boolean("completed").default(false).notNull(),
    lastViewedAt: timestamp("last_viewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userContentUnique: unique().on(table.userId, table.contentId),
  })
);

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
export type ContentApproval = typeof contentApprovals.$inferSelect;
export type NewContentApproval = typeof contentApprovals.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// Road Markings
export const roadMarkings = pgTable("road_markings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // curbs | signals | longitudinal
  nameEn: text("name_en").notNull(),
  nameKm: text("name_km").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKm: text("description_km").notNull().default(""),
  imageUrl: text("image_url"),
  colorCode: text("color_code"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RoadMarking = typeof roadMarkings.$inferSelect;
export type NewRoadMarking = typeof roadMarkings.$inferInsert;
