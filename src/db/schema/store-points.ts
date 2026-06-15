import {
  pgTable,
  serial,
  text,
  integer,
  real,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * store_point_events — the immutable ledger for the Store Points economy.
 *
 * Spec of record: docs/store-points-economy.md (§9). One row per award, spend,
 * hold, release, refund, or legacy-migration event. Balances are DERIVED from
 * these rows (never a mutable column):
 *   store balance   = SUM(delta)
 *   lifetime earned = SUM(delta) WHERE delta > 0
 *   weekly earned   = SUM(delta) WHERE delta > 0 AND play_date in current week
 *
 * Hard rules enforced by the writer (NOT the schema): only role='student'
 * accounts ever get a row; one play awards at most 60; no speed/streak input.
 * Every write carries a unique idempotency_key so retries cannot double-award.
 */
export const storePointEvents = pgTable(
  "store_point_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameType: text("game_type").notNull(), // GameFormat id / mode id, or "store" for spend/refund
    attemptId: text("attempt_id"), // reference to the validated play, when applicable
    playDate: date("play_date").notNull(), // YYYY-MM-DD in Asia/Phnom_Penh (daily/weekly accounting)
    validUnits: integer("valid_units").notNull().default(0),
    correctUnits: integer("correct_units").notNull().default(0),
    accuracy: real("accuracy").notNull().default(0), // 0..1
    performancePoints: integer("performance_points").notNull().default(0),
    completionBonus: integer("completion_bonus").notNull().default(0),
    qualityBonus: integer("quality_bonus").notNull().default(0),
    delta: integer("delta").notNull().default(0), // signed: + earn, - spend/hold
    reason: text("reason").notNull().default("play"), // play | legacy_migration | hold | spend | release | refund
    scoreVersion: integer("score_version").notNull().default(1),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateGameIdx: index("store_point_events_user_date_game_idx").on(
      table.userId,
      table.playDate,
      table.gameType,
    ),
    userTimeIdx: index("store_point_events_user_time_idx").on(table.userId, table.createdAt),
  }),
);

export type StorePointEventRow = typeof storePointEvents.$inferSelect;
export type NewStorePointEventRow = typeof storePointEvents.$inferInsert;

/** Current Store Points score model version (spec §9). */
export const STORE_SCORE_VERSION = 1;
