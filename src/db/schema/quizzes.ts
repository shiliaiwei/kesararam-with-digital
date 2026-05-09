import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  unique,
  date,
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

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id"),
  mode: text("mode").notNull(), // 'quiz', 'practice_test', 'challenge'
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  score: integer("score").notNull(),
  percentage: integer("percentage").notNull(),
  timeSpent: integer("time_spent"), // seconds
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => quizAttempts.id),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  isCorrect: boolean("is_correct").notNull(),
  points: integer("points").notNull(),
  timeSpent: integer("time_spent"), // seconds
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

// The actual DB table for live sessions is challenge_sessions
export const sessions = pgTable("challenge_sessions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id"),
  quizId: integer("quiz_id").references(() => quizzes.id),
  roomCode: text("room_code").unique(),
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
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  isCorrect: boolean("is_correct").notNull(),
  points: integer("points").default(0).notNull(),
  timeBonus: integer("time_bonus").default(0).notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const leaderboardEntries = pgTable(
  "leaderboard_entries",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id"), // NULL for overall rankings
    score: integer("score").default(0).notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    totalAttempts: integer("total_attempts").default(0).notNull(),
    rank: integer("rank"),
    period: text("period").notNull(), // 'weekly', 'monthly', 'all-time'
    periodStart: date("period_start").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    studentCategoryPeriodUnique: unique().on(
      table.studentId,
      table.categoryId,
      table.period,
      table.periodStart
    ),
  })
);

export type Quiz = typeof quizzes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type NewQuizAnswer = typeof quizAnswers.$inferInsert;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type NewLeaderboardEntry = typeof leaderboardEntries.$inferInsert;
