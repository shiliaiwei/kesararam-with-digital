import { pgTable, serial, varchar, integer, timestamp, boolean, text, index, unique } from "drizzle-orm/pg-core";
import { users, classes } from "./users";

export const gameSessions = pgTable(
  "game_sessions",
  {
    id: serial("id").primaryKey(),
    sessionCode: varchar("session_code", { length: 6 }).notNull().unique(),
    hostId: integer("host_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameMode: varchar("game_mode", { length: 50 }).notNull(),
    category: varchar("category", { length: 100 }),
    classId: integer("class_id").references(() => classes.id, { onDelete: "set null" }),
    difficulty: varchar("difficulty", { length: 20 }),
    questionIds: integer("question_ids").array().notNull(),
    // Non-MCQ live games (e.g. "tick-sign" / Click the Sign) store their per-step
    // round payload here as JSON; MCQ sessions leave it null and use questionIds.
    roundData: text("round_data"),
    currentQuestionIndex: integer("current_question_index").default(0),
    questionStartedAt: timestamp("question_started_at"),
    status: varchar("status", { length: 20 }).notNull().default("lobby"),
    // One-shot guard: flipped true the first time final scores are synced to
    // user profiles + the points ledger, so a retried/double "end" can't
    // double-count live points. See syncScoresToUserProfiles.
    scoresSynced: boolean("scores_synced").notNull().default(false),
    scoringMode: varchar("scoring_mode", { length: 20 }).notNull().default("speed"),
    timePerQuestion: integer("time_per_question").notNull().default(30),
    maxPlayers: integer("max_players").notNull().default(50),
    language: varchar("language", { length: 10 }).notNull().default("both"),
    targetGroup: varchar("target_group", { length: 50 }).notNull().default("university"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
  },
  (table) => ({
    sessionCodeIdx: index("game_sessions_session_code_idx").on(table.sessionCode),
    hostIdIdx: index("game_sessions_host_id_idx").on(table.hostId),
  })
);

export const gameParticipants = pgTable(
  "game_participants",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    avatar: text("avatar"),
    totalScore: integer("total_score").notNull().default(0),
    correctAnswers: integer("correct_answers").notNull().default(0),
    currentStreak: integer("current_streak").notNull().default(0),
    isConnected: boolean("is_connected").default(true),
    rank: integer("rank").default(0),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  },
  (table) => ({
    sessionUserUnique: unique("game_participants_session_user_unique").on(
      table.sessionId,
      table.userId
    ),
    sessionIdIdx: index("game_participants_session_id_idx").on(table.sessionId),
  })
);

export const gameSessionAnswers = pgTable(
  "game_session_answers",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull(),
    answerId: integer("answer_id"),
    answeredAt: timestamp("answered_at").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    speedScore: integer("speed_score").notNull().default(0),
    streakBonus: integer("streak_bonus").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),
    remainingTimeMs: integer("remaining_time_ms").notNull().default(0),
    // Streak value BEFORE this answer — lets us correctly reverse score/streak
    // when a student changes their answer before the timer ends.
    prevStreak: integer("prev_streak").notNull().default(0),
  },
  (table) => ({
    sessionUserQuestionUnique: unique("game_session_answers_session_user_question_unique").on(
      table.sessionId,
      table.userId,
      table.questionId
    ),
    sessionIdIdx: index("game_session_answers_session_id_idx").on(table.sessionId),
  })
);
