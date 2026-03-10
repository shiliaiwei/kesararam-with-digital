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
import { contentItems } from "./content";

export const levelEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);
export const challengeTypeEnum = pgEnum("challenge_type", [
  "play",
  "quiz",
  "flashcard",
  "data",
  "infographic",
]);
export const sessionStatusEnum = pgEnum("session_status", [
  "waiting",
  "active",
  "paused",
  "ended",
]);

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleKh: text("title_kh").notNull().default(""),
  categorySlug: text("category_slug").notNull(),
  level: levelEnum("level").notNull().default("beginner"),
  createdBy: integer("created_by").references(() => users.id),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  roomCode: text("room_code").notNull().unique(),
  challengeType: challengeTypeEnum("challenge_type").notNull().default("quiz"),
  level: levelEnum("level").notNull().default("beginner"),
  maxStudents: integer("max_students").default(31).notNull(),
  timeLimitSeconds: integer("time_limit_seconds").default(30).notNull(),
  status: sessionStatusEnum("status").notNull().default("waiting"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionParticipants = pgTable("session_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  score: integer("score").default(0).notNull(),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const sessionAnswers = pgTable("session_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  questionId: integer("question_id")
    .notNull()
    .references(() => quizQuestions.id),
  isCorrect: boolean("is_correct").notNull(),
  points: integer("points").default(0).notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  score: integer("score").default(0).notNull(),
  rank: integer("rank"),
  period: text("period").notNull(), // e.g. "2026-Q1"
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
