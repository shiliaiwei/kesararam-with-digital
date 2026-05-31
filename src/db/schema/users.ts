import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  uniqueIndex,
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
  schoolName: text("school_name"),
  province: text("province"),
  gradeLevel: text("grade_level"),
  section: text("section"),
  classId: integer("class_id"),
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
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  schoolName: text("school_name").notNull(),
  province: text("province").notNull(),
  gradeLevel: text("grade_level").notNull(),
  section: text("section"),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  code: text("code").notNull().unique(),
  isLocked: boolean("is_locked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
}, (table) => ({
  classStudentUnique: uniqueIndex("class_enrollments_class_student_unique").on(
    table.classId,
    table.studentId
  ),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;

/**
 * Relations for users
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  currentClass: one(classes, {
    fields: [users.classId],
    references: [classes.id],
  }),
  enrollments: many(classEnrollments),
}));

/**
 * Relations for classes
 */
export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  enrollments: many(classEnrollments),
}));

/**
 * Relations for class enrollments
 */
export const classEnrollmentsRelations = relations(
  classEnrollments,
  ({ one }) => ({
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
