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

export const planEnum = pgEnum("plan_tier", [
  "free",
  "teacher_pro",
  "school",
  "family",
  "driving_school",
]);
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
    /** Stripe linkage — set when a user self-purchases via card checkout */
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    billingCycle: text("billing_cycle"), // "monthly" | "yearly" | null
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
export const usersSubscriptionsRelations = relations(users, ({ one, many }: any) => ({
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
 * Teacher applications — public, plan-driven sign-up requests.
 * A pending row is created when someone applies for a paid plan from /pricing.
 * No user account is created here: an admin reviews the request, verifies the
 * KHQR payment, then provisions the teacher account + assigns the subscription
 * (keeps the child-safety policy that teacher accounts are admin-created).
 */
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
]);

export const teacherApplications = pgTable(
  "teacher_applications",
  {
    id: serial("id").primaryKey(),
    // Applicant
    displayName: text("display_name").notNull(),
    email: text("email").notNull(), // school / Google email to allowlist on approval
    phone: text("phone"), // phone or Telegram handle
    schoolName: text("school_name"),
    province: text("province"),
    // Plan intent
    plan: planEnum("plan").notNull(), // teacher_pro | school | driving_school
    billingCycle: text("billing_cycle").notNull(), // "monthly" | "yearly"
    seats: integer("seats"), // School: number of teacher accounts
    academyName: text("academy_name"), // Academy (driving_school)
    note: text("note"), // optional applicant message
    // Workflow
    status: applicationStatusEnum("status").notNull().default("pending"),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (table: any) => ({
    statusIdx: index("teacher_apps_status_idx").on(table.status),
    emailIdx: index("teacher_apps_email_idx").on(table.email),
  }),
);

export type TeacherApplication = typeof teacherApplications.$inferSelect;
export type NewTeacherApplication = typeof teacherApplications.$inferInsert;

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
  family: {
    name: "Family",
    maxStudents: 9, // children tracked under one parent account
    maxClasses: 0,
    analytics: true, // child progress dashboard
    customContent: false,
    priority: 1,
  },
  teacher_pro: {
    name: "Teacher Pro",
    maxStudents: 50,
    maxClasses: 5,
    analytics: true,
    customContent: true,
    priority: 2,
  },
  school: {
    name: "School",
    maxStudents: -1, // unlimited
    maxClasses: -1, // unlimited
    analytics: true,
    customContent: true,
    priority: 3,
  },
  driving_school: {
    name: "Driving School",
    maxStudents: -1, // unlimited learners
    maxClasses: -1, // unlimited
    analytics: true,
    customContent: true,
    priority: 4,
  },
} as const;

export type PlanTier = keyof typeof PLAN_FEATURES;
