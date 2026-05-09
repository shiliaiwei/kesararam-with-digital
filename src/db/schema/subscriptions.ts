import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
export const subscriptions = pgTable(
  "subscriptions",
  {
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
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (table: any) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  })
);

/**
 * Relations for subscriptions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const subscriptionsRelations = relations(subscriptions, ({ one }: any) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
    relationName: "userSubscription",
  }),
  assignedByUser: one(users, {
    fields: [subscriptions.assignedBy],
    references: [users.id],
    relationName: "assignedSubscriptions",
  }),
}));

/**
 * Relations for users (defined here to avoid circular dependency)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usersRelations = relations(users, ({ one, many }: any) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
    relationName: "userSubscription",
  }),
  assignedSubscriptions: many(subscriptions, {
    relationName: "assignedSubscriptions",
  }),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

/**
 * Subscription plan features and limits
 */
export const PLAN_FEATURES = {
  free: {
    name: "Free",
    maxStudents: 0,
    maxClasses: 0,
    analytics: false,
    customContent: false,
    priority: 0,
  },
  teacher_pro: {
    name: "Teacher Pro",
    maxStudents: 50,
    maxClasses: 5,
    analytics: true,
    customContent: true,
    priority: 1,
  },
  school: {
    name: "School",
    maxStudents: -1, // unlimited
    maxClasses: -1, // unlimited
    analytics: true,
    customContent: true,
    priority: 2,
  },
} as const;

export type PlanTier = keyof typeof PLAN_FEATURES;
