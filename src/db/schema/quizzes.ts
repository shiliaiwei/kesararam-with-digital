import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { contentItems } from "./content";

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleKm: text("title_km").notNull().default(""),
  categoryId: integer("category_id"),
  level: text("level").notNull().default("beginner"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id),
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

// The actual DB table for live sessions is challenge_sessions
export const sessions = pgTable("challenge_sessions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  roomCode: text("room_code"),
  challengeType: text("challenge_type"),
  level: text("level"),
  maxStudents: integer("max_students").default(40),
  status: text("status").notNull().default("waiting"),
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
