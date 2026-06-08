import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["student", "teacher", "admin", "staff"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  displayName: text("display_name"),
  avatar: text("avatar"),
  avatarChangedAt: timestamp("avatar_changed_at"),
  usernameChangedAt: timestamp("username_changed_at"),
  audioMuted: boolean("audio_muted").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  lastLoginAt: timestamp("last_login_at"),
  highestScore: integer("highest_score").default(0).notNull(),
  totalGamesPlayed: integer("total_games_played").default(0).notNull(),
  lifetimePoints: integer("lifetime_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  schoolName: text("school_name"),
  province: text("province"),
  gradeLevel: text("grade_level"),
  section: text("section"),
  parentContact: text("parent_contact"),
  claimedRewards: text("claimed_rewards").default("[]").notNull(),
  googleId: text("google_id").unique(),
  isProfilePublic: boolean("is_profile_public").default(false).notNull(),
  isNamePublic: boolean("is_name_public").default(false).notNull(),
  isUsernamePublic: boolean("is_username_public").default(false).notNull(),
  isSchoolPublic: boolean("is_school_public").default(false).notNull(),
  isProvincePublic: boolean("is_province_public").default(false).notNull(),
  isGradePublic: boolean("is_grade_public").default(false).notNull(),
  isSectionPublic: boolean("is_section_public").default(false).notNull(),
  isStatsPublic: boolean("is_stats_public").default(false).notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  gradeLevel: text("grade_level"),
  schoolName: text("school_name"),
  province: text("province"),
  section: text("section"),
  status: text("status").default("active").notNull(), // active, locked, archived
  nameChangedCount: integer("name_changed_count").default(0).notNull(),
});

export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),
  enrolledBy: integer("enrolled_by").references(() => users.id), // staff/admin who assigned
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  classId: integer("class_id")
    .references(() => classes.id, { onDelete: "cascade" }),
  isUsed: boolean("is_used").default(false).notNull(),
  usedById: integer("used_by_id").references(() => users.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type NewInviteCode = typeof inviteCodes.$inferInsert;

/**
 * Relations for classes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const classesRelations = relations(classes, ({ one, many }: any) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  enrollments: many(classEnrollments),
}));

/**
 * Relations for class enrollments
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const classEnrollmentsRelations = relations(
  classEnrollments,
  ({ one }: any) => ({
    class: one(classes, {
      fields: [classEnrollments.classId],
      references: [classes.id],
    }),
    student: one(users, {
      fields: [classEnrollments.studentId],
      references: [users.id],
    }),
    enrolledByUser: one(users, {
      fields: [classEnrollments.enrolledBy],
      references: [users.id],
    }),
  })
);

/**
 * Relations for invite codes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inviteCodesRelations = relations(inviteCodes, ({ one }: any) => ({
  teacher: one(users, {
    fields: [inviteCodes.teacherId],
    references: [users.id],
  }),
  usedBy: one(users, {
    fields: [inviteCodes.usedById],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [inviteCodes.classId],
    references: [classes.id],
  }),
}));
