import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const planEnum = pgEnum("plan_tier", ["free", "teacher_pro", "school"]);
export const subStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
  "trial",
]);

/**
 * Subscriptions — only admins can INSERT/UPDATE rows here.
 * No payment gateway: admin manually assigns plans (anti-cheat by design).
 */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("free"),
  status: subStatusEnum("status").notNull().default("active"),
  /** Scarcity offer: 1-month free trial, admin-granted only */
  isTrial: boolean("is_trial").notNull().default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  endsAt: timestamp("ends_at"), // null = lifetime / until cancelled
  /** Admin who assigned this subscription */
  assignedBy: integer("assigned_by")
    .notNull()
    .references(() => users.id),
  /** Optional note from admin (e.g. "Promo - Phnom Penh school") */
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
