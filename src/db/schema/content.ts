import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  titleEn: text("title_en").notNull(),
  titleKm: text("title_km"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  titleEn: text("title_en").notNull(),
  titleKm: text("title_km").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKm: text("description_km").notNull().default(""),
  imageUrl: text("image_url"),
  imageSource: text("image_source").default("url"), // 'url' | 'cloudinary'
  audioUrlEn: text("audio_url_en"),
  audioSourceEn: text("audio_source_en").default("url"),
  audioUrlKm: text("audio_url_km"),
  audioSourceKm: text("audio_source_km").default("url"),
  questionEn: text("question_en").notNull().default(""),
  questionKm: text("question_km").notNull().default(""),
  answerEn: text("answer_en").notNull().default(""),
  answerKm: text("answer_km").notNull().default(""),
  hintEn: text("hint_en"),
  hintKm: text("hint_km"),
  scorePoints: integer("score_points").default(10).notNull(),
  timeLimit: integer("time_limit").default(30).notNull(),
  difficulty: text("difficulty"),
  subtopic: text("subtopic"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  frontEn: text("front_en").notNull(),
  frontKm: text("front_km").notNull().default(""),
  backEn: text("back_en").notNull(),
  backKm: text("back_km").notNull().default(""),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contentApprovals = pgTable("content_approvals", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // 'approved', 'rejected'
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    contentId: integer("content_id")
      .notNull()
      .references(() => contentItems.id),
    completed: boolean("completed").default(false).notNull(),
    lastViewedAt: timestamp("last_viewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userContentUnique: unique().on(table.userId, table.contentId),
  })
);

export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
export type ContentApproval = typeof contentApprovals.$inferSelect;
export type NewContentApproval = typeof contentApprovals.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// Road Markings
export const roadMarkings = pgTable("road_markings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // curbs | signals | longitudinal
  nameEn: text("name_en").notNull(),
  nameKm: text("name_km").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKm: text("description_km").notNull().default(""),
  imageUrl: text("image_url"),
  colorCode: text("color_code"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RoadMarking = typeof roadMarkings.$inferSelect;
export type NewRoadMarking = typeof roadMarkings.$inferInsert;

// Traffic Signs with Approval Workflow
export const trafficSigns = pgTable("traffic_signs", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleKm: text("title_km").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionKm: text("description_km").notNull(),
  imageUrl: text("image_url").notNull(),
  audioUrlEn: text("audio_url_en"),
  audioUrlKm: text("audio_url_km"),
  
  // Classification
  signType: text("sign_type").notNull(), // warning | regulatory | informational | guide
  category: text("category"), // speed | parking | direction | etc
  
  // Workflow
  status: text("status").notNull().default("pending"), // pending | approved | rejected | inactive
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  // Metadata
  isActive: boolean("is_active").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trafficSignApprovals = pgTable("traffic_sign_approvals", {
  id: serial("id").primaryKey(),
  signId: integer("sign_id")
    .notNull()
    .references(() => trafficSigns.id),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // approved | rejected
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TrafficSign = typeof trafficSigns.$inferSelect;
export type NewTrafficSign = typeof trafficSigns.$inferInsert;
export type TrafficSignApproval = typeof trafficSignApprovals.$inferSelect;
export type NewTrafficSignApproval = typeof trafficSignApprovals.$inferInsert;

// Media Resources
export const mediaResources = pgTable("media_resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // image | audio | video | logo | brand
  url: text("url").notNull(),
  source: text("source").notNull().default("cloudinary"), // cloudinary | external
  cloudinaryId: text("cloudinary_id"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"), // for audio/video in seconds
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content-Media Relationship
export const contentMedia = pgTable("content_media", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  mediaId: integer("media_id")
    .notNull()
    .references(() => mediaResources.id, { onDelete: "cascade" }),
  usageType: text("usage_type").notNull(), // primary | thumbnail | reference | explanation
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game Mode Content Links
export const gameModeContent = pgTable("game_mode_content", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade" }),
  gameMode: text("game_mode").notNull(), // flashcard | quiz | practice | challenge
  isActive: boolean("is_active").default(true).notNull(),
  difficultyOverride: text("difficulty_override"),
  pointsOverride: integer("points_override"),
  timeLimitOverride: integer("time_limit_override"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staff Activity Metrics
export const staffActivityMetrics = pgTable("staff_activity_metrics", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id")
    .notNull()
    .references(() => users.id),
  actionType: text("action_type").notNull(), // create | update | delete | submit
  contentId: integer("content_id").references(() => contentItems.id),
  categoryId: integer("category_id"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Review Metrics
export const adminReviewMetrics = pgTable("admin_review_metrics", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id),
  contentId: integer("content_id")
    .notNull()
    .references(() => contentItems.id),
  action: text("action").notNull(), // approved | rejected | requested_changes
  reviewTime: integer("review_time"), // seconds
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MediaResource = typeof mediaResources.$inferSelect;
export type NewMediaResource = typeof mediaResources.$inferInsert;
export type ContentMedia = typeof contentMedia.$inferSelect;
export type NewContentMedia = typeof contentMedia.$inferInsert;
export type GameModeContent = typeof gameModeContent.$inferSelect;
export type NewGameModeContent = typeof gameModeContent.$inferInsert;
export type StaffActivityMetric = typeof staffActivityMetrics.$inferSelect;
export type NewStaffActivityMetric = typeof staffActivityMetrics.$inferInsert;
export type AdminReviewMetric = typeof adminReviewMetrics.$inferSelect;
export type NewAdminReviewMetric = typeof adminReviewMetrics.$inferInsert;

// Questions table - one topic can have multiple questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .references(() => topics.id, { onDelete: "cascade" }),
  contentId: integer("content_id")
    .references(() => contentItems.id, { onDelete: "cascade" }),
  questionType: text("question_type").notNull().default("quiz"), // quiz | flashcard | challenge | practice
  questionEn: text("question_en").notNull(),
  questionKm: text("question_km").notNull().default(""),
  hintEn: text("hint_en"),
  hintKm: text("hint_km"),
  imageUrl: text("image_url"),
  imageSource: text("image_source").default("url"),
  audioUrlEn: text("audio_url_en"),
  audioSourceEn: text("audio_source_en").default("url"),
  audioUrlKm: text("audio_url_km"),
  audioSourceKm: text("audio_source_km").default("url"),
  difficulty: text("difficulty").default("medium"),
  status: text("status").default("draft"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Answers table - one question can have up to 5 answers
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  answerType: text("answer_type").notNull(), // 'text_short' | 'text_paragraph' | 'multiple_choice' | 'checkbox' | 'dropdown' | 'rating' | 'image_selection'
  answerEn: text("answer_en").notNull(),
  answerKm: text("answer_km").notNull().default(""),
  isCorrect: boolean("is_correct").default(false).notNull(),
  imageUrl: text("image_url"),
  imageSource: text("image_source").default("url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  metadata: text("metadata"), // JSON for additional data like rating scale, selection limits
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

// Topics table - replaces content_items for topic-level data
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  topicCode: text("topic_code").notNull().unique(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  nameEn: text("name_en").notNull(),
  nameKm: text("name_km").notNull(),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionKm: text("description_km").notNull().default(""),
  primaryImageUrl: text("primary_image_url"),
  primaryImageSource: text("primary_image_source").default("url"),
  lawReference: text("law_reference"),
  subGroup: text("sub_group"),
  audioUrlEn: text("audio_url_en"),
  audioSourceEn: text("audio_source_en").default("url"),
  audioUrlKm: text("audio_url_km"),
  audioSourceKm: text("audio_source_km").default("url"),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game Modes
export const gameModes = pgTable("game_modes", {
  id: serial("id").primaryKey(),
  modeKey: text("mode_key").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameKm: text("name_km").notNull(),
  descriptionEn: text("description_en"),
  descriptionKm: text("description_km"),
  tagLabel: text("tag_label"),
  questionCount: integer("question_count").default(10),
  timeLimit: integer("time_limit"),
  timerPerQuestion: boolean("timer_per_question").default(false),
  categoriesIncluded: text("categories_included").array(),
  difficultyLevels: text("difficulty_levels").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Learning Mode Settings
export const learningModeSettings = pgTable("learning_mode_settings", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id),
  modeType: text("mode_type").notNull(),
  settings: text("settings").notNull().default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Challenge Sessions (teacher-led live challenges)
export const challengeSessions = pgTable("challenge_sessions", {
  id: serial("id").primaryKey(),
  sessionCode: text("session_code").notNull().unique(),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  sessionName: text("session_name").notNull(),
  categoryIds: integer("category_ids").array(),
  difficultyLevels: text("difficulty_levels").array(),
  questionCount: integer("question_count").notNull(),
  timePerQuestion: integer("time_per_question").notNull(),
  scoringMode: text("scoring_mode").default("speed"),
  allowLateJoin: boolean("allow_late_join").default(true),
  language: text("language").default("both"),
  status: text("status").default("lobby"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Challenge Participants
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => challengeSessions.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  score: integer("score").default(0),
  correctAnswers: integer("correct_answers").default(0),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Daily Challenge Sets
export const dailyChallengeSets = pgTable("daily_challenge_sets", {
  id: serial("id").primaryKey(),
  challengeDate: text("challenge_date").notNull().unique(),
  questionIds: integer("question_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Streaks
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastPlayDate: text("last_play_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game Scores
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameMode: text("game_mode").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeTaken: integer("time_taken"),
  difficulty: text("difficulty"),
  categoryBreakdown: text("category_breakdown"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staff Category Assignments
export const staffCategoryAssignments = pgTable("staff_category_assignments", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type GameMode = typeof gameModes.$inferSelect;
export type NewGameMode = typeof gameModes.$inferInsert;
export type LearningModeSetting = typeof learningModeSettings.$inferSelect;
export type NewLearningModeSetting = typeof learningModeSettings.$inferInsert;
export type ChallengeSession = typeof challengeSessions.$inferSelect;
export type NewChallengeSession = typeof challengeSessions.$inferInsert;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type NewChallengeParticipant = typeof challengeParticipants.$inferInsert;
export type DailyChallengeSet = typeof dailyChallengeSets.$inferSelect;
export type NewDailyChallengeSet = typeof dailyChallengeSets.$inferInsert;
export type UserStreak = typeof userStreaks.$inferSelect;
export type NewUserStreak = typeof userStreaks.$inferInsert;
export type GameScore = typeof gameScores.$inferSelect;
export type NewGameScore = typeof gameScores.$inferInsert;
export type StaffCategoryAssignment = typeof staffCategoryAssignments.$inferSelect;
export type NewStaffCategoryAssignment = typeof staffCategoryAssignments.$inferInsert;
