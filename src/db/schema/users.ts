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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;

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
